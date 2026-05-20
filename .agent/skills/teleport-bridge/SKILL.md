---
name: teleport-bridge
description:
  "Telegram reporting bridge for AI agents. Sends short progress reports
  to user's phone and listens for reply instructions while user is AFK.
  Supports all agents: Antigravity, Claude Code, Codex."
auto-trigger: true
trigger-phrases:
  - "tele me"
  - "tele report"
  - "send telegram"
  - "ping me when done"
  - "ping me on telegram"
  - "report via telegram"
  - "gửi tele"
  - "báo cáo qua tele"
  - "tele cho tôi"
  - "tele khi xong"
  - "ping tele"
version: 1.0
priority: HIGH
---

# Teleport Bridge — Telegram Reporting for All AI Agents

> **Purpose:** Let AI agents send short progress reports to Telegram and receive
> instructions back, so the user can leave the desk while work continues.

## Prerequisite Check

Before using teleport, verify it exists:

```
Check: Does `../teleport/scripts/send-telegram.mjs` exist?
  YES → proceed
  NO  → Tell user:
    "Teleport chưa được cài. Chạy `/setup-teleport` để cài đặt tự động,
     hoặc clone thủ công: git clone https://github.com/thith/teleport.git ../teleport/"
```

## How Teleport Works

Teleport is a **system-wide tool** that lives as a sibling directory:

```
~/Projects/
├── teleport/          ← shared by ALL projects
│   ├── .env           ← Bot token + Chat ID
│   └── scripts/       ← send + listen scripts
├── ProjectA/          ← calls ../teleport/scripts/...
└── ProjectB/          ← calls ../teleport/scripts/...
```

**Key design:** Zero deps (pure Node built-ins). One bot, one chat, shared `.env`.

---

## Sending Reports

### Command

```bash
node ../teleport/scripts/send-telegram.mjs "<message>"
```

### Message Format

```
<emoji> *<Agent> on <topic>:*
✅ done item
✅ another done item
⬜ pending item
```

### Agent Identity Prefixes

| Agent           | Prefix Example                       |
| --------------- | ------------------------------------ |
| **Antigravity** | `🦊 *Gemini on database migration:*` |
| **Claude Code** | `🐋 *Claude on API refactor:*`       |
| **Codex**       | `🤖 *Codex on test fixes:*`          |

### Rules

- **Thread emoji:** Pick a random emoji on first send, reuse for all messages in thread
- **Under 320 chars** (soft limit) — phone screen, not console
- **Language:** Match user's conversation language
- **Project code:** Auto-derived from `basename(cwd)` — no manual config needed

### Sending Files

```bash
node ../teleport/scripts/send-telegram.mjs --file <path> "caption"
```

### Flags

- `--raw` — skip auto-escape (already MarkdownV2)
- `--plain` — no markdown parsing
- `--reply-to <messageId>` — reply to specific message
- `--react <messageId>` — react 👍 to message

---

## Listening for Replies

After every send, you **MUST** start a reply listener. The approach differs by agent:

### Capturing messageId from send output

```
[send-telegram] sent to 123456789 (messageId: 5821)
```

Extract the number after `messageId:`. Track as `IDS` (comma-separated, grows with each send).

### State to Track

- `IDS` = all messageIds sent in this conversation (comma-separated)
- `FIRST` = the very first messageId (used for offset file name)
- `LAST` = most recent messageId
- `E` = thread emoji (constant per conversation)

---

### For Antigravity / Codex / Gemini CLI (Foreground Loop)

Run the listener **synchronously** after every send. It blocks until reply arrives:

```bash
until node ../teleport/scripts/tele-listen.mjs --filter-reply-to {IDS} --offset-file ../teleport/scripts/tmp/tele-reply/{FIRST}-offset.txt; do sleep 5; done
```

When reply arrives: command exits 0, output contains `prompt written to <path>`.
Read that JSON file, process the instruction, respond, then restart listener with updated IDS.

### For Claude Code (Monitor Tool)

> **🚨 ONE CONVERSATION = ONE MONITOR. ALWAYS.**
> TaskStop the previous Monitor before starting a new one.

```bash
# Step A — stop previous Monitor (skip on first send):
TaskStop(task_id: {LAST_MONITOR_ID})

# Step B — start new Monitor with updated IDS:
Monitor({
  command: "until node ../teleport/scripts/tele-listen.mjs --filter-reply-to {IDS} --offset-file ../teleport/scripts/tmp/tele-reply/{FIRST}-offset.txt; do sleep 12; done",
  timeout_ms: 300000,
  persistent: true,
  description: "Telegram reply to messageId {LAST}"
})
```

---

## Handling Replies

1. When listener exits successfully, parse the prompt file path from output
2. Read JSON file → contains `{text, messageId, chatId, ...}`
3. Delete the prompt file
4. Process the user's instruction
5. Reply: `node ../teleport/scripts/send-telegram.mjs --reply-to <prompt.messageId> "E <response>"`
6. Capture new messageId, append to IDS
7. Restart listener with updated IDS

---

## Integration with AWF Workflows

Teleport integrates naturally with long-running AWF workflows:

| Workflow      | When to Report                                    |
| ------------- | ------------------------------------------------- |
| `/deploy`     | After deploy completes — send result (pass/fail)  |
| `/code`       | After self-healing loop finishes — send summary   |
| `/test`       | After test suite completes — send pass/fail count |
| `/fix-issues` | After fixing batch of issues — send fix summary   |
| `/debug`      | After root cause found — send diagnosis           |

### Auto-Offer Pattern

At the END of any long-running workflow, if `../teleport/` exists:

```
Ask: "Task xong rồi. Gửi báo cáo qua Telegram không? (y/n)"
If yes → send report using the format above
```

---

## Error Handling

- **Non-zero exit from send:** Network/auth failure → report to user, do NOT silently ignore
- **Markdown reject:** Script auto-falls-back to `.md` file attachment
- **Long messages (>4000 chars):** Auto-sent as `.md` file attachment (one messageId)
- **Orphan messages:** User messages without reply-to → auto 💔 reaction + explanation

---

## Security Notes

- Bot token lives in `../teleport/.env` — NEVER commit to project repo
- `../teleport/` should be in `.gitignore` of every project
- Scripts read from `../teleport/.env`, not from project's env files
- No secrets are ever sent through Telegram messages
