---
trigger: "/setup-teleport"
description: "📡 Setup Telegram reporting bridge (teleport) — clone, configure bot, test"
---

# /setup-teleport — One-Click Teleport Setup

> **Purpose:** Clone teleport as sibling directory, configure Telegram bot, and verify it works.
> Works on Windows (PowerShell), macOS, and Linux.

---

## Phase 1: Check Existing Installation

```
Check if ../teleport/ already exists:
  YES → Skip to Phase 3 (verify)
  NO  → Proceed to Phase 2 (install)
```

### Step 1.1: Detect OS and shell

```bash
# Windows (PowerShell):
Test-Path ../teleport/scripts/send-telegram.mjs

# macOS/Linux:
test -f ../teleport/scripts/send-telegram.mjs
```

---

## Phase 2: Clone & Configure

### Step 2.1: Clone repository

```bash
# From the parent directory of current project
git clone https://github.com/thith/teleport.git ../teleport/
```

### Step 2.2: Guide user through bot creation

Display to user:

```
📡 Teleport Setup — Tạo Telegram Bot

Bạn cần 2 thứ:

1️⃣ Bot Token:
   - Mở Telegram → tìm @BotFather
   - Gõ /newbot → đặt tên bot → copy token
   - Token trông như: 7123456789:AAH...xyz

2️⃣ Chat ID của bạn:
   - Mở Telegram → tìm @userinfobot
   - Nhấn Start → copy số ID (ví dụ: 123456789)

   Hoặc nếu dùng group chat:
   - Tạo group → thêm bot + @RawDataBot
   - RawDataBot sẽ in ra group ID (số âm)
   - Xong thì kick @RawDataBot

Hãy paste Bot Token và Chat ID cho tôi:
```

### Step 2.3: Create .env file

```bash
# Write to ../teleport/.env
echo "REPORT_BOT_TOKEN=<token_from_user>" > ../teleport/.env
echo "TELEGRAM_ADMIN_CHAT_ID=<chat_id_from_user>" >> ../teleport/.env
```

> ⚠️ **SECURITY:** Never commit .env to git. The teleport repo's .gitignore already excludes it.

---

## Phase 3: Verify Installation

### Step 3.1: Send test message

```bash
node ../teleport/scripts/send-telegram.mjs "🎉 Teleport setup complete! AI Forge is connected."
```

### Step 3.2: Check result

```
✅ Thấy tin nhắn trong Telegram? → Setup thành công!
❌ Không thấy? → Kiểm tra lại:
   - Bot token có đúng không?
   - Chat ID có đúng không?
   - Bot đã được thêm vào group chat chưa? (nếu dùng group)
```

---

## Phase 4: Wire into Agent Configs (Optional)

Teleport đã được tích hợp sẵn vào AWF template qua:

- **Skill:** `.agent/skills/teleport-bridge/SKILL.md`
- **Rules:** Section "Telegram Reporting" trong `AGENTS.md`

Nếu muốn bật teleport cho TẤT CẢ projects (global), paste snippet sau vào:

| Agent           | Global Config File                                 |
| --------------- | -------------------------------------------------- |
| **Antigravity** | `~/.gemini/GEMINI.md` (hoặc Settings → User Rules) |
| **Claude Code** | `~/.claude/CLAUDE.md`                              |
| **Codex**       | `~/.codex/AGENTS.md`                               |

**Snippet to paste:**

```markdown
## Telegram Reporting

WHENEVER the user asks to "send a Telegram report" (or variants: "tele me",
"ping me when done", "gửi tele", "báo cáo qua tele"…), read
`../teleport/rules/telegram-guide.md` and follow it.
Invocation:

- Send: `node ../teleport/scripts/send-telegram.mjs "<message>"`
- Listen: `node ../teleport/scripts/tele-listen.mjs --filter-reply-to <IDS> --offset-file ../teleport/scripts/tmp/tele-reply/<offset-file>`
```

> **Note:** Bước này KHÔNG bắt buộc nếu bạn chỉ dùng AWF projects (đã có skill tích hợp sẵn).
> Chỉ cần khi muốn teleport hoạt động ở projects NGOÀI AWF.

---

## Phase 5: Summary

```
📡 Teleport Setup Complete!

✅ Cloned: ../teleport/
✅ Bot configured: .env created
✅ Test message: sent successfully
✅ AWF integration: skill + rules active

Cách dùng:
  - Gõ "tele me" hoặc "gửi tele" trong bất kỳ session nào
  - Agent sẽ tự gửi báo cáo và chờ phản hồi từ Telegram

Lưu ý trước khi AFK:
  - Antigravity: Settings → Auto Execution → Always Proceed
  - Claude Code: Auto Mode (không phải auto-accept)
  - Codex: Auto-Review mode
  - Giữ máy tính thức (không cho sleep)
```

---

## Troubleshooting

| Vấn đề                          | Giải pháp                                                                 |
| ------------------------------- | ------------------------------------------------------------------------- |
| `ENOENT: ../teleport/`          | Clone lại: `git clone https://github.com/thith/teleport.git ../teleport/` |
| `Missing REPORT_BOT_TOKEN`      | Kiểm tra `../teleport/.env` — bot token có đúng không?                    |
| Bot không gửi tin               | Bot chưa được Start trong Telegram — mở bot và nhấn Start                 |
| Group chat không nhận           | Bot chưa được thêm vào group — thêm bot vào group                         |
| Permission denied (Antigravity) | Enable Agent Non-Workspace File Access — teleport nằm ngoài workspace     |
| `node` not found                | Cài Node.js — teleport cần `node` trên PATH                               |
