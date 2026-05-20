---
name: setup-services
description: "One-click setup for GitHub repo, Cloudflare Worker, and CI/CD pipeline via browser or CLI"
---

# /setup-services — Bootstrap External Services

> **Mục tiêu: User chỉ cần đăng nhập browser → AI làm hết phần còn lại.**

## Trigger

User types `/setup-services`

## Pre-requisites

- User đã đăng nhập GitHub trong browser
- User đã đăng nhập Cloudflare trong browser (nếu dùng Second Brain)

---

## Steps

### Phase 1: Detection — CLI or Browser?

```bash
# Check GitHub CLI
gh auth status 2>&1
# → Authenticated? Use CLI for GitHub ops
# → Not authenticated? Use browser

# Check Cloudflare CLI
npx wrangler whoami 2>&1
# → Authenticated? Use CLI for Cloudflare ops
# → Not authenticated? Use browser
```

**Ask user:**

> "Tôi phát hiện: GitHub CLI = {status}, Wrangler = {status}.
> Bạn muốn tôi dùng browser (bạn đã login) hay CLI?"

### Phase 2: GitHub Repository Setup

**Via CLI (preferred):**

```bash
# Create private repo
gh repo create {project-name} --private --source=. --push

# Enable GitHub Actions
gh workflow enable

# Set up branch protection
gh api repos/{owner}/{repo}/branches/main/protection \
  -X PUT -f required_pull_request_reviews='{"required_approving_review_count":0}'
```

**Via Browser (fallback):**

```
browser_subagent:
1. Navigate to https://github.com/new
2. Fill: name={project-name}, private=true
3. Create repository
4. Return the repo URL
```

Then push local code:

```bash
git remote add origin {repo-url}
git push -u origin main
```

### Phase 3: GitHub Secrets (Requires User Input)

**Via CLI:**

```bash
# AI reads .env.production.example and lists needed secrets
# Then for each secret:
gh secret set SECRET_NAME
# (prompts user to paste value)
```

**Via Browser:**

```
browser_subagent:
1. Navigate to {repo-url}/settings/secrets/actions
2. Tell user: "Click 'New repository secret' and add:"
   - GEMINI_API_KEY_1: your first Gemini API key
   - GEMINI_API_KEY_2: your second Gemini API key
   - (list from .github/workflows requirements)
3. Wait for user confirmation
```

### Phase 4: GitHub Actions — Self-Hosted Runner

**Ask user:** "Bạn có server để chạy self-hosted runner không?"

If YES:

```
browser_subagent:
1. Navigate to {repo-url}/settings/actions/runners
2. Click "New self-hosted runner"
3. Read the registration token
4. Tell user: "SSH vào server và chạy:
   bash scripts/deploy/install-github-runner.sh --token {TOKEN} --url {REPO_URL}"
```

If NO:

> "OK, GitHub Actions sẽ dùng hosted runner (có giới hạn 2000 min/tháng free)."

### Phase 5: Cloudflare — Second Brain Worker

**Ask user:** "Bạn muốn deploy Second Brain (bộ nhớ dài hạn) lên Cloudflare không?"

If YES:

**Via CLI (preferred):**

```bash
cd second-brain
npx wrangler deploy
npx wrangler d1 create {project-name}-memories
npx wrangler secret put AUTH_TOKEN
npx wrangler secret put AI_API_KEY
```

**Via Browser (fallback):**

```
browser_subagent:
1. Navigate to https://dash.cloudflare.com
2. Go to Workers & Pages → Create application
3. Create worker: {project-name}-brain
4. Quick Edit → paste code from second-brain/src/worker.ts
5. Deploy
6. Go to D1 → Create database: {project-name}-memories
7. Bind D1 to worker
8. Go to worker Settings → Variables & Secrets
9. Tell user to add:
   - AUTH_TOKEN: {random generated}
   - AI_API_KEY: {user's Gemini key}
10. Return the worker URL: https://{project-name}-brain.{user}.workers.dev
```

### Phase 6: Connect Everything

```bash
# Update MCP config with Second Brain URL
# (if Cloudflare was set up)

# Verify GitHub Actions work
git commit --allow-empty -m "chore: test CI pipeline"
git push

# Watch the action run
gh run watch
```

### Phase 7: Verification + Remember

1. Verify checklist:
   - [ ] GitHub repo created and code pushed
   - [ ] GitHub Actions running
   - [ ] Secrets configured
   - [ ] Self-hosted runner registered (if applicable)
   - [ ] Cloudflare Worker deployed (if applicable)
   - [ ] D1 database created and bound (if applicable)

2. **AUTO-REMEMBER:**

   ```bash
   python .agent/skills/auto-memory/scripts/local_brain.py remember \
     "Services setup complete" \
     "GitHub: {repo-url}. Runner: {yes/no}. Cloudflare: {worker-url or N/A}." \
     --tags setup infrastructure services --type lesson
   ```

3. Update `.planning/STATE.md`

### Phase 8: Next Steps

- `/brainstorm` → Start planning features
- `/plan` → Create implementation plan
- `/code` → Start coding
