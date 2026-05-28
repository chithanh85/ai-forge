# CLAUDE.md — Hướng dẫn cho Claude Code CLI

> Đây là file hướng dẫn dành riêng cho Claude Code CLI (Anthropic).
> Các quy tắc chung áp dụng cho **tất cả** AI agents (bao gồm cả Claude) nằm trong `AGENTS.md`.

## 🚨 BẮT BUỘC ĐỌC TRƯỚC

**Đọc `AGENTS.md` TRƯỚC KHI bắt đầu bất kỳ tác vụ nào.**

## Kickoff Line (Bắt buộc)

Mỗi tác vụ PHẢI bắt đầu bằng:

```
Read-Check: [<files>] | Scope: <scope> | Verify: <cmds> | Recalled: <yes/no>
```

## 🤖 Định tuyến & Điều phối Agent (Tự động)

Trước khi viết code/thiết kế:

1. **Đọc `@[agents/orchestrator]`** — tự động phân tích request, chọn agent, điều phối song song
2. Orchestrator tự quyết định: 1 agent (simple) hay nhiều agents song song (complex)
3. Thông báo: `🤖 Áp dụng kiến thức của @[agent]...`
4. Nạp các skills được yêu cầu trong agent frontmatter

## 🛑 Socratic Gate

Với các yêu cầu phức tạp, DỪNG LẠI và HỎI tối thiểu 3 câu hỏi chiến lược trước khi bắt đầu code.

## 🌐 Ngôn ngữ

- Trả lời bằng ngôn ngữ của người dùng
- Code comment / tên biến bằng tiếng Anh

## Quy tắc Cốt lõi

1. **Database**: UUID PKs, TIMESTAMPTZ, index tất cả FKs, ngăn N+1.
2. **Testing**: TDD bắt buộc. Red-Green-Refactor.
3. **Security**: Tự phản ánh Red Team trước khi commit.
4. **Knowledge**: `recall()` trước khi code, `remember()` sau khi học được bài học.
5. **Clean Code**: Tự giải thích, không comment thừa.

## 🧠 Second Brain Protocol (BẮT BUỘC)

### Phát hiện: MCP vs Local Fallback

```
Khi bắt đầu session, kiểm tra:
1. MCP tool `mcp_second-brain_remember` có khả dụng không?
   → CÓ: Dùng MCP tools
   → KHÔNG: Dùng local fallback:
     python .agent/skills/auto-memory/scripts/local_brain.py
```

### Auto-RECALL (Trước khi làm)

| Trigger                | Action                                    |
| ---------------------- | ----------------------------------------- |
| Bắt đầu session        | `recall("{project_name} recent context")` |
| Trước `/debug`         | `recall("{error message}")`               |
| Trước `/code` phức tạp | `recall("{feature name} patterns")`       |
| Trước `/deploy`        | `recall("deploy issues")`                 |

### Auto-REMEMBER (Sau khi làm)

| Trigger                 | Lưu gì                                                |
| ----------------------- | ----------------------------------------------------- |
| Sửa xong bug (BẮT BUỘC) | `{triệu chứng, nguyên nhân gốc, cách sửa, guardrail}` |
| Sau `/brainstorm`       | `{requirements, decisions, rejected options}`         |
| Sau `/code` hoàn thành  | `{patterns used, gotchas, integration notes}`         |
| Sau `/deploy`           | `{version, env, result, rollback info}`               |
| Quyết định kiến trúc    | `{ADR: what, why, trade-offs}`                        |

## 🔁 Self-Healing Loop

1. AI viết code
2. Chạy tests → nếu FAIL, tự sửa (tối đa 3 lần)
3. Nếu vẫn FAIL → báo cáo cho người dùng
4. Tất cả bản sửa → `remember()` bài học (BẮT BUỘC)

## ⚡ Parallel Execution (Tự động)

> **Quy tắc**: Nếu task có 2+ phần độc lập → PHẢI chạy song song.

- `@[agents/orchestrator]` tự phân tích dependency graph
- Load `@[skills/parallel-agents]` để spawn subagents song song (tối đa 4)
- Tổng hợp kết quả + kiểm tra conflict sau merge
- Tự quyết định: song song, tuần tự, hoặc kết hợp cả hai

## 📁 Skills & Workflows

Claude Code có thể truy cập tất cả skills và workflows giống như Antigravity:

- **Skills**: Nằm trong `.agent/skills/` — mỗi skill có file `SKILL.md` mô tả
- **Workflows**: Nằm trong `.agent/workflows/` — kích hoạt bằng các lệnh `/`
- **BA Pipeline**: Gõ `/ba-pipeline` để chạy quy trình BA tự động (UC → US → Plan)

## 📡 Telegram Reporting (Teleport Bridge)

> Send short progress reports to user's Telegram while they are AFK.
> Full protocol: `@[skills/teleport-bridge]` | Setup: `/setup-teleport`

### Trigger Phrases

"tele me", "gửi tele", "ping me when done", "báo cáo qua tele", "tele khi xong"

### Claude Code-Specific: Monitor Pattern

Claude Code uses the **Monitor tool** (not foreground loop):

```bash
# Step A — TaskStop previous Monitor (skip on first send):
TaskStop(task_id: {LAST_MONITOR_ID})

# Step B — start new Monitor with updated IDS:
Monitor({
  command: "until node ../teleport/scripts/tele-listen.mjs --filter-reply-to {IDS} --offset-file ../teleport/scripts/tmp/tele-reply/{FIRST}-offset.txt; do sleep 12; done",
  timeout_ms: 300000,
  persistent: true,
  description: "Telegram reply to messageId {LAST}"
})
```

> **🚨 ONE CONVERSATION = ONE MONITOR. ALWAYS.**
> Two Monitors = silent data-loss bug. Always TaskStop before starting new one.

### Quick Send

```bash
node ../teleport/scripts/send-telegram.mjs "🐋 *Claude on <topic>:*
✅ task done
⬜ task pending"
```

## Kiểm tra (Trước khi hoàn thành)

- Backend: `pnpm test`
- Frontend: `pnpm lint`
- Security: `/audit` (runs `vbs-scan-security` — 21 vulnerability rules)
- Audit đầy đủ: `python .agent/scripts/checklist.py .`

## Kết thúc Session

Mỗi session phải kết thúc với:

- Những gì đã thay đổi (files)
- Lý do thay đổi (mục tiêu/rủi ro)
- Đã kiểm tra gì (commands + pass/fail)
- Các tác vụ còn lại
- `remember()` bài học / quyết định quan trọng
- Cập nhật `.planning/STATE.md`

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ai-forge** (354 symbols, 384 relationships, 3 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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
