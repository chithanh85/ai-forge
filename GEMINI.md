---
trigger: always_on
---

# GEMINI.md — AI Forge AI Orchestrator

> Core rules for Antigravity (Google AI) in this project.

## 🚨 MANDATORY PREFLIGHT

**Read `AGENTS.md` FIRST before ANY task.**

## 🤖 Agent Routing & Orchestration (Auto)

Before ANY code/design response:

1. **Read `@[agents/orchestrator]`** — tự động phân tích request, chọn agent, điều phối song song
2. Orchestrator tự quyết định: 1 agent (simple) hay nhiều agents song song (complex)
3. Announce: `🤖 Applying knowledge of @[agent]...`
4. Load required skills from agent's frontmatter

## 🛑 Socratic Gate

For complex requests, STOP and ASK minimum 3 strategic questions before implementation.

## 🌐 Language

- Respond in user's language
- Code comments/variables in English

## 🧹 Clean Code (Global)

- Concise, self-documenting code
- Testing mandatory: Unit > Integration > E2E
- TDD: Red-Green-Refactor cycle

## 🗄️ Database Design (Mandatory)

When any task involves database/model:

- Activate agent `database-architect` + skill `database-design`
- UUID/ULID primary keys (no auto-increment)
- `created_at` + `updated_at` (TIMESTAMPTZ) on every table
- Index all foreign keys
- Prevent N+1 queries

## 🔒 Security

Before committing, self-reflect as Red Team:
"If I were a hacker, how would I attack this code?"

## 🧠 Second Brain Protocol (MANDATORY — Auto-Enforced)

> **This is NOT optional. The AI MUST save and recall knowledge automatically.**

### Detection: MCP vs Local Fallback

```
At session start, check:
1. Is MCP tool `mcp_second-brain_remember` available?
   → YES: Use MCP tools (Cloudflare Worker)
   → NO: Use local fallback script:
     python .agent/skills/auto-memory/scripts/local_brain.py
```

### Auto-RECALL (Before Work)

| Trigger                        | Action                                    |
| ------------------------------ | ----------------------------------------- |
| Session starts                 | `recall("{project_name} recent context")` |
| Before `/debug`                | `recall("{error message or symptom}")`    |
| Before `/code` complex feature | `recall("{feature name} patterns")`       |
| Before `/deploy`               | `recall("deploy issues {environment}")`   |
| Before architecture decision   | `recall("{technology or pattern}")`       |

**Implementation (choose based on detection):**

```bash
# MCP available:
mcp_second-brain_recall(query="project context")

# Local fallback:
python .agent/skills/auto-memory/scripts/local_brain.py recall "project context"
```

### Auto-REMEMBER (After Work)

| Trigger                            | What to Save                                        |
| ---------------------------------- | --------------------------------------------------- |
| **After fixing a bug** (MANDATORY) | `{symptom, root_cause, fix, guardrail, prevention}` |
| After `/brainstorm` decisions      | `{requirements, decisions, rejected options}`       |
| After `/code` completion           | `{patterns used, gotchas, integration notes}`       |
| After `/deploy`                    | `{version, env, result, rollback info}`             |
| After architecture decision        | `{ADR: what, why, trade-offs, migration}`           |
| When user says something important | `{user preference, constraint, decision}`           |

**Implementation (choose based on detection):**

```bash
# MCP available:
mcp_second-brain_remember(
  topic="Fixed N+1 query in OrderService",
  detail="Root cause: loop with individual queries. Fix: JOIN with eager loading.",
  tags=["bugfix", "performance", "database"]
)

# Local fallback:
python .agent/skills/auto-memory/scripts/local_brain.py remember \
  "Fixed N+1 query in OrderService" \
  "Root cause: loop with individual queries. Fix: JOIN with eager loading." \
  --tags bugfix performance database --type incident
```

### Auto-Save Validation

> 🔴 **VIOLATION:** Ending a debug session without `remember()` the root cause.
> 🔴 **VIOLATION:** Starting a complex task without `recall()` first.
> 🔴 **VIOLATION:** Making architecture decision without checking past decisions.

## 🔁 Self-Healing Loop

1. AI viết code
2. Run tests → if FAIL, auto-fix (max 3 retries)
3. If still FAIL → escalate to human
4. All fixes → `remember()` lesson learned (MANDATORY)

## ⚡ Parallel Execution (Auto)

> **Quy tắc**: Nếu task có 2+ phần độc lập → PHẢI chạy song song.

- `@[agents/orchestrator]` tự phân tích dependency graph
- Load `@[skills/parallel-agents]` để spawn subagents song song (tối đa 4)
- Tổng hợp kết quả + kiểm tra conflict sau merge
- Tự quyết định: song song, tuần tự, hoặc kết hợp cả hai

## 🌐 Browser Ops Protocol (External Services)

> **AI can use the browser to interact with GitHub, Cloudflare, and other services the user is logged into.**

### Decision: CLI vs Browser

```
1. Check CLI availability: gh auth status / wrangler whoami
2. CLI available? → Use CLI (faster, scriptable)
3. CLI not available? → Ask user: "Bạn đã đăng nhập {service} trong browser?"
4. User confirms → Use browser_subagent
```

### Key Command: `/setup-services`

Bootstraps GitHub repo + Cloudflare Worker + CI/CD in one workflow.
Read: `.agent/workflows/setup-services.md`

### Security Rules

- ❌ NEVER screenshot/read pages showing secrets or tokens
- ❌ NEVER copy secrets from browser into chat
- ✅ Navigate user to the right settings page
- ✅ Create resources (repos, workers, databases)
- ✅ Configure non-sensitive settings

### Skill Reference

Full protocol: `@[skills/browser-ops]`

## 📡 Telegram Reporting (Teleport Bridge)

> Send short progress reports to user's Telegram while they are AFK.
> Full protocol: `@[skills/teleport-bridge]` | Setup: `/setup-teleport`

### Auto-Detection

```
At session start or when user triggers:
1. Check: Test-Path ../teleport/scripts/send-telegram.mjs
   YES → Teleport available
   NO  → If user asks, suggest /setup-teleport
```

### Trigger Phrases

"tele me", "gửi tele", "ping me when done", "báo cáo qua tele", "tele khi xong"

### Antigravity-Specific Notes

- **Must enable** Agent Non-Workspace File Access (teleport lives at `../teleport/`, outside workspace)
- **Must enable** Auto Execution → Always Proceed (so listener doesn't get blocked)
- Use **foreground loop** pattern (not Monitor — that's Claude-only)
- If YoloMode extension installed, no manual approval needed

### Quick Send

```bash
node ../teleport/scripts/send-telegram.mjs "🦊 *Gemini on <topic>:*
✅ task done
⬜ task pending"
```

## 📁 File Hygiene

- Scripts in `scripts/<area>/`
- Docs in `docs/`
- No ad-hoc files in root

## ✅ Task Completion

Task is NOT done until:

1. Tests pass
2. Lint passes
3. `python .agent/scripts/checklist.py .` succeeds
4. Lessons learned saved to Second Brain (if applicable)
5. `.planning/STATE.md` updated
