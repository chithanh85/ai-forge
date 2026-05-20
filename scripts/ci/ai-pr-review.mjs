/**
 * AI PR Review Script
 * Reviews pull request diffs using Gemini API with multi-key rotation.
 * 
 * Flow:
 *   1. Fetch PR diff from GitHub API
 *   2. Send each file's diff to Gemini for review
 *   3. Post summary comment on the PR
 *   4. Create structured GitHub Issues for critical/security findings
 *      → Issues are picked up by LOCAL AI agents (Antigravity/Claude) for fixing
 *      → Local agents have full codebase context, can run tests, self-healing loop
 *
 * Environment variables:
 *   GITHUB_TOKEN, LLM_API_KEY, LLM_API_KEY_2, LLM_API_KEY_3,
 *   PR_NUMBER, REPO_OWNER, REPO_NAME,
 *   LLM_PROVIDER, LLM_MODEL, REVIEW_MODE,
 *   AI_PR_REVIEW_REQUEST_DELAY_MS, AI_PR_REVIEW_MAX_FILES,
 *   AI_PR_REVIEW_MAX_LLM_ATTEMPTS, AI_PR_REVIEW_MAX_TOTAL_COMMENTS,
 *   AI_PR_REVIEW_CREATE_ISSUES, AI_PR_REVIEW_MAX_ISSUES_PER_RUN
 */

const {
  GITHUB_TOKEN,
  LLM_API_KEY, LLM_API_KEY_2, LLM_API_KEY_3,
  PR_NUMBER, REPO_OWNER, REPO_NAME,
  LLM_PROVIDER = 'google',
  LLM_MODEL = 'gemini-2.5-flash',
  REVIEW_MODE = 'advisory',
  AI_PR_REVIEW_REQUEST_DELAY_MS = '6500',
  AI_PR_REVIEW_MAX_FILES = '5',
  AI_PR_REVIEW_MAX_LLM_ATTEMPTS = '2',
  AI_PR_REVIEW_MAX_TOTAL_COMMENTS = '30',
  AI_PR_REVIEW_CREATE_ISSUES = 'true',
  AI_PR_REVIEW_MAX_ISSUES_PER_RUN = '3',
} = process.env;

// Multi-key rotation
const API_KEYS = [LLM_API_KEY, LLM_API_KEY_2, LLM_API_KEY_3].filter(Boolean);
let currentKeyIndex = 0;

function getNextKey() {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGemini(prompt, attempt = 0) {
  const key = getNextKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${LLM_MODEL}:generateContent?key=${key}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
      }),
    });

    if (res.status === 429 && attempt < parseInt(AI_PR_REVIEW_MAX_LLM_ATTEMPTS)) {
      console.log(`  ⚠️ Rate limited, rotating key and retrying...`);
      await sleep(parseInt(AI_PR_REVIEW_REQUEST_DELAY_MS));
      return callGemini(prompt, attempt + 1);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (err) {
    if (attempt < parseInt(AI_PR_REVIEW_MAX_LLM_ATTEMPTS)) {
      console.log(`  ⚠️ LLM error, retrying (${attempt + 1})...`);
      return callGemini(prompt, attempt + 1);
    }
    throw err;
  }
}

async function getPRDiff() {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${PR_NUMBER}/files`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
  });
  return res.json();
}

async function postComment(body) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${PR_NUMBER}/comments`;
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
}

/**
 * Create a structured GitHub Issue that local AI agents can parse and auto-fix.
 * Issue body follows a machine-readable format with YAML-like metadata block.
 */
async function createStructuredIssue(finding, severity) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;

  const labels = ['ai-review', 'auto-fixable'];
  if (severity === 'critical') labels.push('priority:critical');
  if (severity === 'security') labels.push('security');

  const body = [
    `## 🤖 AI-Detected Issue`,
    ``,
    `> This issue was automatically created by AI PR Review.`,
    `> **Local AI agents** (Antigravity/Claude) can auto-fix this using \`/fix-issues\`.`,
    ``,
    `### Metadata`,
    `\`\`\`yaml`,
    `source: ai-pr-review`,
    `pr: ${PR_NUMBER}`,
    `file: ${finding.file}`,
    `severity: ${severity}`,
    `model: ${LLM_MODEL}`,
    `auto_fixable: true`,
    `\`\`\``,
    ``,
    `### Finding`,
    `**File:** \`${finding.file}\``,
    ``,
    finding.review,
    ``,
    `### Diff Context`,
    `\`\`\`diff`,
    finding.patch ? finding.patch.slice(0, 2000) : '(no diff available)',
    `\`\`\``,
    ``,
    `---`,
    `_To auto-fix: open your IDE and run \`/fix-issues\` in AI chat._`,
  ].join('\n');

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `🤖 [${severity.toUpperCase()}] ${finding.file} — AI Review (PR #${PR_NUMBER})`,
      body,
      labels,
    }),
  });

  const issue = await res.json();
  return issue.number;
}

async function main() {
  console.log(`🤖 AI PR Review — PR #${PR_NUMBER}`);
  console.log(`   Model: ${LLM_MODEL} | Keys: ${API_KEYS.length} | Mode: ${REVIEW_MODE}`);

  const files = await getPRDiff();
  const maxFiles = parseInt(AI_PR_REVIEW_MAX_FILES);
  const reviewFiles = files.slice(0, maxFiles);

  console.log(`   Files: ${files.length} total, reviewing ${reviewFiles.length}`);

  const allFindings = [];

  for (const file of reviewFiles) {
    if (!file.patch) continue;
    console.log(`   📄 Reviewing: ${file.filename}`);

    const prompt = `You are a senior code reviewer. Review this diff and find bugs, security issues, and improvements.

File: ${file.filename}
Diff:
${file.patch.slice(0, 3000)}

Rules:
- Focus on REAL bugs and security issues, not style preferences
- Database: Check for N+1 queries, missing indexes, SQL injection
- Security: Check for secrets, XSS, broken auth
- Be concise. Format as bullet points.
- If no issues found, say "LGTM"`;

    const review = await callGemini(prompt);
    if (review && !review.includes('LGTM')) {
      allFindings.push({ file: file.filename, review, patch: file.patch });
    }

    await sleep(parseInt(AI_PR_REVIEW_REQUEST_DELAY_MS));
  }

  // Post summary comment on PR
  if (allFindings.length > 0) {
    const comment = `## 🤖 AI Review (${REVIEW_MODE})\n\n` +
      allFindings.map(f => `### \`${f.file}\`\n${f.review}`).join('\n\n') +
      `\n\n---\n_Reviewed by ${LLM_MODEL} | ${allFindings.length} file(s) with findings_` +
      `\n\n> 💡 **To auto-fix:** Run \`/fix-issues\` in your local AI chat (Antigravity/Claude).`;

    await postComment(comment);
    console.log(`   💬 Posted review with ${allFindings.length} findings`);

    // Create structured issues for critical/security findings
    if (AI_PR_REVIEW_CREATE_ISSUES === 'true') {
      const maxIssues = parseInt(AI_PR_REVIEW_MAX_ISSUES_PER_RUN);
      let issuesCreated = 0;

      for (const f of allFindings) {
        if (issuesCreated >= maxIssues) break;

        const reviewLower = f.review.toLowerCase();
        let severity = null;

        if (reviewLower.includes('security') || reviewLower.includes('injection') || reviewLower.includes('xss')) {
          severity = 'security';
        } else if (reviewLower.includes('critical') || reviewLower.includes('crash') || reviewLower.includes('data loss')) {
          severity = 'critical';
        } else if (reviewLower.includes('bug') || reviewLower.includes('error') || reviewLower.includes('n+1')) {
          severity = 'bug';
        }

        if (severity) {
          const issueNum = await createStructuredIssue(f, severity);
          console.log(`   📋 Created issue #${issueNum} [${severity}] for ${f.file}`);
          issuesCreated++;
        }
      }

      if (issuesCreated > 0) {
        console.log(`   📋 Total: ${issuesCreated} issue(s) created → local AI agents will auto-fix`);
      }
    }
  } else {
    await postComment(`## 🤖 AI Review\n\n✅ **LGTM** — No issues found.\n\n_Reviewed by ${LLM_MODEL}_`);
    console.log(`   ✅ No issues found`);
  }
}

main().catch(err => {
  console.error('❌ AI Review failed:', err.message);
  process.exit(1);
});
