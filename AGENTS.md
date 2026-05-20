# AGENTS.md — Repo-Local Rules for All AI Clients

> These rules apply to ALL AI agents (Antigravity, Claude, Codex) working in this repo.

## 1. PREFLIGHT

- Read `.planning/STATE.md` to understand current project state.
- Read `docs/wiki-index.md` for knowledge wiki navigation.
- **AUTO-ORCHESTRATE**: Read `@[agents/orchestrator]` — it auto-analyzes requests, selects best agent(s), and coordinates parallel execution when needed.
- Use Obsidian graph scan before implementing: `python .agent/scripts/obsidian_graph.py info <concept>`
- **AUTO-RECALL** from Second Brain: `recall("{task topic}")` (see Rule 7)

## 2. KICKOFF LINE (Mandatory)

Every task MUST start with:
`Read-Check: [<files>] | Scope: <scope> | Verify: <cmds> | Recalled: <yes/no>`

## 3. FILE HYGIENE

- Docs in `docs/`. Scripts in `scripts/<area>/`.
- No ad-hoc files in root.
- Secrets, `.env`, credentials must stay untracked.

## 4. DATABASE STANDARDS

- UUID/ULID primary keys only (no auto-increment)
- `created_at` + `updated_at` (TIMESTAMPTZ) on every table
- Index all foreign keys (B-tree)
- GIN index for JSONB columns
- Prevent N+1 queries (use JOIN / include / DataLoader)
- Soft deletes with partial indexes when applicable

## 5. TESTING

- TDD mandatory: Write test first, then code
- Testing pyramid: Unit > Integration > E2E
- Bug fix = regression test (lock the bug)

## 6. SECURITY

- Red Team reflection before commit
- No secrets in code (pre-commit scanner enforces)
- Production DB: READ-ONLY access for AI

## 7. SECOND BRAIN PROTOCOL (AUTO-ENFORCED)

> 🔴 **CRITICAL:** This is the project's long-term memory. Non-compliance = knowledge loss.

### Detection (Run Once Per Session)

```
Check if MCP Second Brain is available:
  Available → use mcp_second-brain_remember / mcp_second-brain_recall
  Not available → use local fallback:
    python .agent/skills/auto-memory/scripts/local_brain.py <command>
```

### Auto-RECALL Triggers (Before Work)

| Before This           | Recall What                        |
| --------------------- | ---------------------------------- |
| Any non-trivial task  | `recall("{task topic}")`           |
| Debug session         | `recall("{error message}")`        |
| Architecture decision | `recall("{technology} decisions")` |
| Deployment            | `recall("deploy issues")`          |

### Auto-REMEMBER Triggers (After Work)

| After This                | Remember What                             |
| ------------------------- | ----------------------------------------- |
| Bug fix (MANDATORY)       | Symptom → Root cause → Fix → Guardrail    |
| Brainstorm decision       | Requirements, decisions, rejected options |
| Architecture choice       | ADR: what, why, trade-offs                |
| Deployment                | Version, env, result, rollback info       |
| Self-healing loop fix     | What failed, why, auto-fix applied        |
| Important user preference | Constraint, preference, decision          |

### Local Fallback Commands

```bash
# Save
python .agent/skills/auto-memory/scripts/local_brain.py remember \
  "topic" "detail" --tags tag1 tag2 --type lesson

# Search
python .agent/skills/auto-memory/scripts/local_brain.py recall "query"

# Recent
python .agent/skills/auto-memory/scripts/local_brain.py recent --limit 10

# Stats
python .agent/skills/auto-memory/scripts/local_brain.py stats
```

### Violations

- ❌ Ending a debug session without saving the root cause
- ❌ Starting a complex task without checking past knowledge
- ❌ Making architecture decisions without recalling past decisions
- ❌ Self-healing loop fixes without logging the lesson

## 8. SELF-HEALING LOOP

- AI writes code → runs tests → auto-fix if fail (max 3 retries)
- If still fail after 3 retries → escalate to human
- All auto-fixes get logged as lessons learned via `remember()`
- **Parallel mode**: If task has 2+ independent subtasks, invoke `@[agents/orchestrator]` — it will auto-load `parallel-agents` skill and coordinate subagents simultaneously

## 9. BROWSER OPS (External Services)

When task requires GitHub, Cloudflare, or other external services:

1. Check CLI first: `gh auth status` / `wrangler whoami`
2. CLI available → use CLI (preferred)
3. CLI not available → ask user: "Bạn đã login trong browser?"
4. User confirms → use `browser_subagent` tool
5. **Security**: Never screenshot/read pages with tokens or secrets
6. Full protocol: `@[skills/browser-ops]`
7. One-click setup: `/setup-services` workflow

## 10. VERIFICATION (Before Done)

- Lint: `pnpm lint`
- Test: `pnpm test`
- Audit: `python .agent/scripts/checklist.py .`

## 11. HANDOFF (End of Session)

Every session must end with:

- What changed (files)
- Why it changed (goal/risk)
- What was verified (commands + pass/fail)
- Remaining tasks
- `remember()` key lessons/decisions from this session
- Update `.planning/STATE.md`

## 12. TELEGRAM REPORTING (Optional — Teleport Bridge)

> 📡 Lets AI agents send progress reports to Telegram while user is AFK.

### Detection (Auto)

```
Check: Does ../teleport/scripts/send-telegram.mjs exist?
  YES → Teleport available, can send reports
  NO  → Not installed. If user asks, suggest: /setup-teleport
```

### Trigger Phrases

When user says any of these, activate `@[skills/teleport-bridge]`:

- "tele me", "send telegram", "ping me when done"
- "gửi tele", "báo cáo qua tele", "tele cho tôi khi xong"
- "report via telegram", "ping tele"

### Quick Reference (All Agents)

```bash
# Send report:
node ../teleport/scripts/send-telegram.mjs "<emoji> *<Agent> on <topic>:*
✅ done
⬜ pending"

# Listen for reply (foreground — Antigravity, Codex, Gemini CLI):
until node ../teleport/scripts/tele-listen.mjs \
  --filter-reply-to <IDS> \
  --offset-file ../teleport/scripts/tmp/tele-reply/<FIRST>-offset.txt; \
do sleep 5; done
```

### Auto-Offer After Long Tasks

At the end of `/deploy`, `/code`, `/test`, `/fix-issues` — if teleport is available:

```
"Task hoàn tất. Gửi báo cáo qua Telegram không?"
```

### Before Going AFK

Remind user to enable auto-execution:

- **Antigravity**: Settings → Auto Execution → Always Proceed + Agent Non-Workspace File Access
- **Claude Code**: Auto Mode (not auto-accept)
- **Codex**: Auto-Review mode
- Keep machine awake (no sleep)
