---
name: audit
description: Security Scan & Code Audit (vbs-scan-security)
---

# /audit — Security Scan & Code Audit

## Trigger

User types `/audit`

## Steps

### Phase 1: Preflight + Recall

1. Load skill: `vbs-scan-security`, `vulnerability-scanner`, `red-team-tactics`
2. Activate agent: `security-auditor`
3. **AUTO-RECALL past security issues:**
   ```bash
   # MCP:
   mcp_second-brain_recall(query="security vulnerabilities audit findings")
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py recall "security audit"
   ```
4. Report: known vulnerabilities, past audit patterns (if any)

### Phase 2: Security Scan (vbsec)

Run the `vbs-scan-security` skill against the codebase. The skill auto-detects:

- **Scope**: full repo (default), uncommitted, staged, PR, or specific commit
- **Size routing**: SMALL (inline) or LARGE (sub-agent delegation)
- **Language overlay**: Go, PHP, TypeScript/JS, Python — auto-detected

```
/vbs-scan-security
```

The scan checks 21 vulnerability categories including:

- Hardcoded Secrets, SQL Injection, XSS, IDOR
- Mass Assignment, SSRF, CSRF, Path Traversal
- JWT misuse, CORS misconfiguration, Command Injection
- Broken Access Control, Race Conditions, and more

Report is saved to `vbsec-reports/scan-<timestamp>.md`.

### Phase 3: Scope Selection (Optional)

If user wants a more targeted scan:

```
/vbs-scan-security uncommitted   # only changed files
/vbs-scan-security staged        # pre-commit check
/vbs-scan-security pr id 42      # scan a pull request
/vbs-scan-security commit within 7days  # recent commits
```

### Phase 4: Review & Action

Based on vbsec verdict:

| Verdict  | Meaning                      | Action                       |
| -------- | ---------------------------- | ---------------------------- |
| **FAIL** | ≥1 CRITICAL finding          | Must fix before deploy       |
| **WARN** | ≥1 HIGH finding, no CRITICAL | Strongly recommended to fix  |
| **PASS** | No CRITICAL or HIGH          | Safe to proceed to `/deploy` |

- Present findings with severity breakdown
- For CRITICAL/HIGH: show code before/after fix examples
- Ask user: fix now (`/code`) or acknowledge and proceed?

### Phase 5: Post-Audit + Remember

1. **AUTO-REMEMBER audit results:**
   ```bash
   # MCP:
   mcp_second-brain_remember(
     topic="Security Audit: {verdict} - {date}",
     detail="Scanned {file_count} files. Found {critical} CRITICAL, {high} HIGH. Key issues: {summary}.",
     tags=["security", "audit", "vbsec"]
   )
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py remember \
     "Security Audit: {verdict}" \
     "Found {critical} CRITICAL, {high} HIGH. Issues: {summary}." \
     --tags security audit vbsec --type lesson
   ```
2. Update `.planning/STATE.md`

### Phase 6: Next Steps

- If **PASS**: `/deploy` → Deploy to staging/production
- If **WARN**: `/code` → Fix HIGH issues, then `/audit` again
- If **FAIL**: `/code` → Fix CRITICAL issues immediately, then `/audit` again

### 📡 Teleport Hook (Auto)

If `../teleport/` exists and user is AFK:

```bash
node ../teleport/scripts/send-telegram.mjs "<emoji> *<Agent> on security audit:*
🔒 Verdict: {PASS/WARN/FAIL}
🔴 Critical: {count}
🟡 High: {count}
📄 Report: vbsec-reports/scan-{timestamp}.md"
```

Then start reply listener per `@[skills/teleport-bridge]`.
