/**
 * review-parser.mjs
 * Pure functions to parse Gemini JSON output, sanitize input/output, and map severity levels.
 */

/**
 * Sanitizes Markdown block markers (backticks) to prevent Markdown Injection.
 * Replaces triple backticks with a safe representation.
 * @param {string} text
 * @returns {string} Sanitized text
 */
export function sanitizeMarkdown(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return text.replace(/```/g, " // (fenced code block marker stripped)");
}

/**
 * Extracts and parses JSON from raw LLM output.
 * Performs strict schema validation, normalization, and size limits.
 * If validation fails for any finding, it triggers a fail-closed status.
 * @param {string} rawOutput
 * @returns {object} { findings: Array, error: boolean }
 */
export function parseReviewJSON(rawOutput) {
  if (!rawOutput || typeof rawOutput !== 'string') {
    return { findings: [], error: true };
  }

  let cleanText = rawOutput.trim();

  // Strip markdown block markers if present
  if (cleanText.startsWith('```')) {
    const lines = cleanText.split('\n');
    if (lines[0].startsWith('```')) {
      lines.shift();
    }
    if (lines[lines.length - 1].startsWith('```')) {
      lines.pop();
    }
    cleanText = lines.join('\n').trim();
  }

  try {
    const parsed = JSON.parse(cleanText);
    if (!parsed || !Array.isArray(parsed.findings)) {
      return { findings: [], error: true };
    }

    const validSeverities = ['BLOCKING', 'SUGGESTION', 'NIT', 'QUESTION'];
    const validCategories = ['security', 'bug', 'performance', 'style'];
    const validatedFindings = [];

    for (const f of parsed.findings) {
      if (!f || typeof f !== 'object') {
        return { findings: [], error: true };
      }

      const severity = (f.severity || '').toUpperCase();
      const category = (f.category || '').toLowerCase();

      // Strict Validation: Fail-closed on schema deviation
      if (!validSeverities.includes(severity)) {
        console.error(`⚠️ Strict Validation Failed: Invalid severity "${severity}"`);
        return { findings: [], error: true };
      }
      if (!validCategories.includes(category)) {
        console.error(`⚠️ Strict Validation Failed: Invalid category "${category}"`);
        return { findings: [], error: true };
      }
      if (typeof f.message !== 'string' || f.message.trim().length === 0) {
        console.error('⚠️ Strict Validation Failed: message field must be a non-empty string');
        return { findings: [], error: true };
      }
      if (f.line !== undefined && f.line !== null && (typeof f.line !== 'number' || isNaN(f.line))) {
        console.error(`⚠️ Strict Validation Failed: Invalid line field value: ${f.line}`);
        return { findings: [], error: true };
      }

      // Enforce safety limits on string fields
      const rawMessage = f.message.trim();
      const rawFix = typeof f.suggestedFix === 'string' ? f.suggestedFix : '';

      validatedFindings.push({
        severity,
        category,
        line: f.line || null,
        message: sanitizeMarkdown(rawMessage.slice(0, 1000)),
        suggestedFix: sanitizeMarkdown(rawFix.slice(0, 2000))
      });
    }

    return { findings: validatedFindings, error: false };
  } catch (err) {
    console.error('⚠️ Failed to parse LLM JSON output:', err.message);
    return { findings: [], error: true };
  }
}

/**
 * Maps structured review findings to downstream severity levels.
 * Only BLOCKING issues are mapped to create GitHub Issues.
 * @param {object} finding
 * @returns {string|null} Downstream severity ('security'|'critical'|'bug'|null)
 */
export function mapToDownstreamSeverity(finding) {
  if (!finding || finding.severity !== 'BLOCKING') {
    return null;
  }

  const category = (finding.category || '').toLowerCase();
  
  if (category === 'security') {
    return 'security';
  }
  
  if (category === 'bug') {
    return 'critical';
  }

  return 'bug';
}

/**
 * Determines whether a structured finding should trigger GitHub Issue creation.
 * Encapsulates security gates (fork check, actor whitelist) and severity requirements.
 * @param {object} finding
 * @param {boolean} isFork
 * @param {boolean} createIssuesEnabled
 * @param {string} actor
 * @param {string} trustedActors
 * @returns {boolean}
 */
export function shouldCreateIssue(finding, isFork, createIssuesEnabled, actor, trustedActors) {
  if (!createIssuesEnabled || isFork) {
    return false;
  }

  // Whitelist actor trust gate
  if (trustedActors && typeof trustedActors === 'string') {
    const whitelist = trustedActors.split(',').map(a => a.trim()).filter(Boolean);
    if (whitelist.length > 0 && (!actor || !whitelist.includes(actor))) {
      console.log(`   🔒 Security Gate: Actor "${actor}" is not in the whitelist. Skipping auto-fix issue creation.`);
      return false;
    }
  }

  return finding && finding.severity === 'BLOCKING';
}
