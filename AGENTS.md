# AGENTS.md — Repo-Local Rules for All AI Clients

> These rules apply to ALL AI agents (Antigravity, Claude, Codex) working in this repo.

## 1. PREFLIGHT

- Read `.planning/STATE.md` to understand current project state.
- Read `docs/wiki-index.md` for knowledge wiki navigation.
- **AUTO-ORCHESTRATE**: Read `@[agents/orchestrator]` — it auto-analyzes requests, selects best agent(s), and coordinates parallel execution when needed.
- Use Obsidian graph scan before implementing: `python .agent/scripts/obsidian_graph.py info <concept>`
- **AUTO-RECALL** from Second Brain: `recall("{task topic}")` (see Second Brain Protocol)
- Before writing code, read `.agent/rules/rationalization-prevention.md` and record the rationalization check.

## 1.5 WORK INTAKE CLASSIFICATION

Before choosing a workflow, classify every incoming request:

1. Read `docs/FEATURE_INTAKE.md` for the intake protocol.
2. Determine input type (new feature, change request, bug fix, maintenance, docs, harness improvement).
3. Run the **Risk Checklist** (7 questions) to compute a risk score.
4. Select lane:
   - **Tiny** (0 risk factors): `/code --fast` or direct patch.
   - **Normal** (1–2 risk factors): `/plan` → `/code`.
   - **High-Risk** (3+ risk factors): `/plan` → `/design` → `/code` → `/audit`. Requires human approval at `risk-gate.json`.
5. Announce the lane: `"📋 Intake: [Normal Lane] — 2/7 risk factors detected."`
6. After implementing new behavior, update `docs/TEST_MATRIX.md` with the behavior-to-proof mapping.

## 2. KICKOFF LINE (Mandatory)

Every task MUST start with:
`Read-Check: [<files>] | Scope: <scope> | Verify: <cmds> | Recalled: <yes/no>`

## 3. SIMPLICITY & BEHAVIORAL GUIDELINES (Karpathy's Rules)

These guidelines bias toward caution over speed to reduce common LLM coding mistakes:

### Think Before Coding

- **Don't assume or hide confusion**: Explicitly state assumptions. If uncertain or multiple interpretations exist, ask and surface trade-offs.
- Push back if a simpler approach exists. Stop and name what's confusing before writing code.

### Simplicity First

- **Minimum code that solves the problem**: No speculative features, speculative "flexibility" / "configurability", or abstractions for single-use code.
- No error handling for impossible scenarios. If a solution can be written in 50 lines instead of 200, rewrite it.

### Surgical Changes

- **Touch only what you must**: Do not "improve" adjacent code, comments, or formatting. Do not refactor unbroken things.
- Match the existing style exactly, even if you prefer a different approach.
- Clean up unused imports, variables, or functions created by _your_ changes. Do not remove pre-existing dead code unless asked.

### Goal-Driven Execution

- Define success criteria before implementation and loop until verified.
- Write tests first to reproduce bugs/validations, then make them pass.
- Run the rationalization-prevention check before code, plans, fixes, or completion claims. If an excuse from `.agent/rules/rationalization-prevention.md` applies, record the rebuttal and action in `adversarial-validation.json`.

## 4. FILE HYGIENE

- Docs in `docs/`. Scripts in `scripts/<area>/`.
- No ad-hoc files in root.
- Secrets, `.env`, credentials must stay untracked.

## 5. DATABASE STANDARDS

- UUID/ULID primary keys only (no auto-increment)
- `created_at` + `updated_at` (TIMESTAMPTZ) on every table
- Index all foreign keys (B-tree)
- GIN index for JSONB columns
- Prevent N+1 queries (use JOIN / include / DataLoader)
- Soft deletes with partial indexes when applicable

## 6. TESTING

- TDD mandatory: Write test first, then code
- Testing pyramid: Unit > Integration > E2E
- Bug fix = regression test (lock the bug)

## 7. SECURITY

- Red Team reflection before commit
- No secrets in code (pre-commit scanner enforces)
- Production DB: READ-ONLY access for AI

## 8. CONTRACT-DRIVEN EXECUTION & ARTIFACT GATE

For non-trivial `/plan`, `/code`, and `/debug` work, completion is blocked until the run has the five artifact files under `.agent/artifacts/<run-id>/`:

- `context-snippets.json`
- `risk-gate.json`
- `verification.json`
- `review-decision.json`
- `adversarial-validation.json`

`/plan` and `/code` must produce or validate this contract before implementation:

- Expected output
- Acceptance Criteria with Given-When-Then checks
- Scope boundary
- Non-negotiable constraints
- Touchpoints, including callers, dependents, routes, scripts, docs, external services, and GitNexus findings when applicable

`--fast` means compact, not planless: it may reduce detail, but it must not bypass the contract, risk gate, TDD, or `python .agent/scripts/checklist.py .`.

`/debug` must run Scout & Diagnose before root-cause claims or fix proposals. Scout captures context, conventions, recent commits, and caller/dependent analysis. Diagnose records reproduction status, confirmed cause, unknowns, and `risk-gate.json`.

`checklist.py` auto-discovers `AWF_ARTIFACT_RUN_ID`, `.agent/artifacts/current`, or the latest run directory. Missing runs, missing files, invalid JSON, BLOCK decisions, failed verification/review/adversarial states, or credential-like strings fail closed.

`adversarial-validation.json` must include `rationalization_checks`. `review-decision.json` must include scored reviewer entries; any reviewer score below 3 or reviewer `BLOCK` blocks the run.

## 9. SECOND BRAIN PROTOCOL (AUTO-ENFORCED)

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

## 10. SELF-HEALING LOOP

- AI writes code → runs tests → auto-fix if fail (max 3 retries)
- If still fail after 3 retries → escalate to human
- All auto-fixes get logged as lessons learned via `remember()`
- **Parallel mode**: If task has 2+ independent subtasks, invoke `@[agents/orchestrator]` — it will auto-load `parallel-agents` skill and coordinate subagents simultaneously

## 11. BROWSER OPS (External Services)

When task requires GitHub, Cloudflare, or other external services:

1. Check CLI first: `gh auth status` / `wrangler whoami`
2. CLI available → use CLI (preferred)
3. CLI not available → ask user: "Bạn đã login trong browser?"
4. User confirms → use `browser_subagent` tool
5. **Security**: Never screenshot/read pages with tokens or secrets
6. Full protocol: `@[skills/browser-ops]`
7. One-click setup: `/setup-services` workflow

## 12. VERIFICATION (Before Done)

- Lint: `pnpm lint`
- Test: `pnpm test`
- Wiki links: `python .agent/scripts/wiki_lint.py --strict`
- Audit: `python .agent/scripts/checklist.py .`
- Artifact gate: all five JSON artifacts must validate for the selected run

## 13. HANDOFF (End of Session)

Every session must end with:

- What changed (files)
- Why it changed (goal/risk)
- What was verified (commands + pass/fail)
- Remaining tasks
- `remember()` key lessons/decisions from this session
- Update `.planning/STATE.md`

## 14. TELEGRAM REPORTING (Optional — Teleport Bridge)

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

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ai-forge** (676 symbols, 769 relationships, 3 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource                                  | Use for                                  |
| ----------------------------------------- | ---------------------------------------- |
| `gitnexus://repo/ai-forge/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/ai-forge/clusters`       | All functional areas                     |
| `gitnexus://repo/ai-forge/processes`      | All execution flows                      |
| `gitnexus://repo/ai-forge/process/{name}` | Step-by-step execution trace             |

## CLI

| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |

<!-- gitnexus:end -->
