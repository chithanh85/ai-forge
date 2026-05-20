---
name: browser-ops
description: "Use when AI needs to interact with external services (GitHub, Cloudflare, Vercel, etc.) via browser or CLI. Also handles stealth scraping via CloakBrowser when target has bot detection."
allowed-tools: Read, Write, Edit, RunCommand, BrowserSubagent
version: 1.1
priority: HIGH
auto-trigger: true
---

# Browser Ops — External Service Automation

> **AI can use the browser to interact with services the user is already logged into.**
> This enables zero-config setup — no API tokens needed if user has active browser sessions.

## When This Skill Activates

| Trigger                            | Example                         |
| ---------------------------------- | ------------------------------- |
| Setting up new GitHub repo         | "Create repo for this project"  |
| Configuring GitHub secrets/actions | "Add secrets to GitHub"         |
| Cloudflare Worker deployment       | "Deploy Second Brain worker"    |
| Creating Cloudflare D1/KV          | "Set up database on Cloudflare" |
| Any external service interaction   | "Configure Vercel project"      |
| `/setup-services` workflow         | Full service bootstrap          |

---

## 🔴 Decision Matrix: Browser vs CLI

**Always prefer CLI if available. Fall back to browser when CLI requires tokens the user hasn't configured.**

### GitHub Operations

| Task                        | CLI (preferred)      | Browser (fallback)           |
| --------------------------- | -------------------- | ---------------------------- |
| Create repository           | `gh repo create`     | Open github.com/new          |
| Create issue                | `gh issue create`    | Open repo/issues/new         |
| Create PR                   | `gh pr create`       | Open repo/compare            |
| Add secrets                 | `gh secret set`      | Settings → Secrets → Actions |
| Enable Actions              | `gh workflow enable` | Settings → Actions → Enable  |
| Configure branch protection | ❌ Not available     | Settings → Branches → Rules  |
| Add collaborators           | ❌ Limited           | Settings → Collaborators     |
| Configure webhooks          | ❌ Limited           | Settings → Webhooks          |
| View Actions run logs       | `gh run view`        | Actions tab → Click run      |

### Cloudflare Operations

| Task                | CLI (preferred)                | Browser (fallback)            |
| ------------------- | ------------------------------ | ----------------------------- |
| Deploy Worker       | `wrangler deploy`              | Workers → Create → Paste code |
| Create D1 database  | `wrangler d1 create`           | Workers → D1 → Create         |
| Create KV namespace | `wrangler kv:namespace create` | Workers → KV → Create         |
| Create R2 bucket    | `wrangler r2 bucket create`    | R2 → Create bucket            |
| Set Worker secrets  | `wrangler secret put`          | Worker → Settings → Variables |
| View Worker logs    | `wrangler tail`                | Worker → Logs                 |
| Configure DNS       | ❌ Better in dashboard         | DNS tab                       |
| Configure tunnel    | `cloudflared tunnel`           | Zero Trust → Tunnels          |
| SSL/TLS settings    | ❌ Dashboard only              | SSL/TLS tab                   |

### Detection Protocol

```
At task start, check availability:

1. GitHub CLI:
   Run: gh auth status
   ├── Authenticated → Use CLI
   └── Not authenticated → Ask user:
       "Bạn muốn login gh CLI hoặc tôi dùng browser?"
       ├── "CLI" → gh auth login
       └── "Browser" → Use browser_subagent

2. Cloudflare CLI:
   Run: wrangler whoami
   ├── Authenticated → Use CLI
   └── Not authenticated → Ask user:
       "Bạn muốn login wrangler hoặc tôi dùng browser?"
       ├── "CLI" → wrangler login
       └── "Browser" → Use browser_subagent

3. Scraping a site with bot protection:
   → Use CloakBrowser (see section below)
   └── NOT browser_subagent (visible browser is for logged-in services)
```

---

## 🥷 CloakBrowser — Stealth Scraping Mode

> **Use when:** Target site has bot detection (Cloudflare Turnstile, reCAPTCHA v3, FingerprintJS)
> that blocks standard Playwright/headless Chrome.
> Source: [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) — 17k ⭐, MIT, 30/30 detection tests passed

### CloakBrowser vs Playwright — When to Use Which

| Situation                                    | Use                                     |
| -------------------------------------------- | --------------------------------------- |
| Scraping public site, no bot protection      | Playwright (lighter, faster)            |
| Site blocks headless → Cloudflare/reCAPTCHA  | **CloakBrowser**                        |
| Testing YOUR app (E2E, regression)           | Playwright/Cypress (never CloakBrowser) |
| Interacting with service user is logged into | browser_subagent                        |

### Why CloakBrowser Works

Other stealth tools (playwright-stealth, undetected-chromedriver) **inject JavaScript patches**
— antibot systems detect the patches themselves. CloakBrowser **patches Chromium C++ source code**:

- 57 source-level patches: canvas, WebGL, audio, fonts, GPU, screen, WebRTC, CDP signals
- `humanize=True` — Bézier mouse curves, realistic keyboard timing, scroll patterns
- **0.9 reCAPTCHA v3 score** — human-level, server-verified
- Drop-in Playwright API — same code, one line change

### Install

```bash
# Python
pip install cloakbrowser

# JavaScript / Node.js (with Playwright)
npm install cloakbrowser playwright-core
```

### Migration from Playwright (1 line)

```python
# Before
- from playwright.sync_api import sync_playwright
- pw = sync_playwright().start()
- browser = pw.chromium.launch()

# After — rest of code unchanged
+ from cloakbrowser import launch
+ browser = launch()
```

```javascript
// JavaScript
- import { chromium } from 'playwright'
+ import { launch } from 'cloakbrowser'
const browser = await launch()
// page.goto(), page.click() — all identical
```

### Common Options

```python
from cloakbrowser import launch

# Basic stealth (auto random fingerprint)
browser = launch()

# With proxy + auto timezone/locale detection
browser = launch(proxy="http://user:pass@proxy:8080", geoip=True)

# SOCKS5
browser = launch(proxy="socks5://user:pass@proxy:1080")

# Human-like behavior (mouse, keyboard, scroll)
browser = launch(humanize=True)

# Persistent session (bypass incognito detection)
browser = launch_persistent_context("./profile-dir")

# Headed mode (see the browser)
browser = launch(headless=False)
```

### Docker (zero install)

```bash
docker run --rm cloakhq/cloakbrowser cloaktest
```

### Detection Results (Apr 2026, Chromium 146)

| Service               | Result                                |
| --------------------- | ------------------------------------- |
| Cloudflare Turnstile  | ✅ Non-interactive auto-resolved      |
| reCAPTCHA v3 score    | ✅ 0.9 (human-level, server-verified) |
| FingerprintJS         | ✅ Not blocked                        |
| BrowserScan           | ✅ NORMAL (4/4 checks passed)         |
| `navigator.webdriver` | ✅ `false` (not `true`)               |
| `window.chrome`       | ✅ `object` (not `undefined`)         |

### AI Agent Integrations

CloakBrowser works as drop-in stealth layer for:
`browser-use` · `Crawl4AI` · `Scrapling` · `Stagehand` · `LangChain` · `Selenium`

### Limitations

- ❌ Does NOT solve CAPTCHAs — it **prevents** them from appearing
- ❌ No built-in proxy rotation (bring your own proxies)
- ❌ Binary ~200MB (auto-cached after first download)
- ⚠️ v0.3.x — active development, check CHANGELOG before upgrading
- ⚠️ Separate BINARY-LICENSE (not fully MIT for the compiled binary)

### Profile Manager (Advanced)

Self-hosted alternative to Multilogin/GoLogin — manage browser profiles with unique fingerprints:

```bash
docker run -p 8080:8080 -v cloakprofiles:/data cloakhq/cloakbrowser-manager
# Open http://localhost:8080 → Create profile → Click Launch
```

→ [CloakBrowser-Manager](https://github.com/CloakHQ/CloakBrowser-Manager) — MIT, free

## Browser Usage Protocol

### Pre-conditions

1. User MUST be logged into the service in their browser
2. AI announces: "Tôi sẽ dùng browser để {action}. Bạn đã đăng nhập {service} chưa?"
3. Wait for user confirmation before proceeding

### Browser Subagent Rules

```
When using browser_subagent for external services:

1. ANNOUNCE what you're about to do
2. NAVIGATE to the exact URL (don't search/guess)
3. VERIFY you're on the right page (check page title/content)
4. PERFORM the action step by step
5. SCREENSHOT the result for confirmation
6. REPORT what was done
```

### Security Rules

- ❌ NEVER read or screenshot pages showing secrets/tokens/passwords
- ❌ NEVER copy tokens from browser to chat (user should copy manually)
- ✅ Navigate TO the settings page, tell user what to fill in
- ✅ Create resources (repos, workers, databases)
- ✅ Configure settings (branch protection, actions, DNS)

---

## Common Browser Workflows

### GitHub: Create Repo + Configure

```
1. Navigate to https://github.com/new
2. Fill in:
   - Repository name: {project-name}
   - Description: {from README.md}
   - Visibility: Private (default)
   - Initialize: NO (we have local code)
3. Click "Create repository"
4. Navigate to Settings → Secrets → Actions
5. Tell user: "Please add these secrets manually:
   - GEMINI_API_KEY_1
   - GEMINI_API_KEY_2
   (I won't read your secrets for security)"
6. Navigate to Settings → Actions → General
7. Enable: "Allow all actions and reusable workflows"
8. Navigate to Settings → Branches
9. Add branch protection rule for 'main':
   - Require PR before merging
   - Require status checks
```

### Cloudflare: Deploy Second Brain Worker

```
1. Navigate to https://dash.cloudflare.com
2. Go to Workers & Pages → Create
3. Create Worker named: {project-name}-brain
4. Navigate to Worker → Quick Edit
5. Paste Second Brain worker code
6. Deploy
7. Navigate to Worker → Settings → Variables
8. Tell user: "Please add these environment variables:
   - AUTH_TOKEN: {generate a random token}
   - AI_API_KEY: {your Gemini API key}"
9. Navigate to D1 → Create database
10. Name: {project-name}-memories
11. Bind to worker
```

### GitHub: Self-Hosted Runner Setup

```
1. Navigate to repo Settings → Actions → Runners
2. Click "New self-hosted runner"
3. Read the token from the page
4. Tell user: "Run this on your server:
   bash scripts/deploy/install-github-runner.sh --token {TOKEN}"
```

---

## 🔗 Cross-References

| Topic              | Skill / File                              |
| ------------------ | ----------------------------------------- |
| CI/CD setup        | `@[skills/deployment-procedures]`         |
| Second Brain setup | `second-brain/README.md`                  |
| Security scanning  | `@[skills/vulnerability-scanner]`         |
| Self-hosted runner | `scripts/deploy/install-github-runner.sh` |

---

## Anti-Patterns

| ❌ Don't                             | ✅ Do                                    |
| ------------------------------------ | ---------------------------------------- |
| Screenshot pages with tokens visible | Tell user to copy tokens manually        |
| Assume user is logged in             | Ask first, then proceed                  |
| Use browser when CLI works           | CLI is faster and more reliable          |
| Store credentials in code            | Guide user to set env vars / secrets     |
| Automate without announcing          | Always tell user what you're about to do |
