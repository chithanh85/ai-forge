---
trigger: "/fix-issues"
description: "🔧 Tự động fetch GitHub Issues từ AI Review, fix code local với full context + test, rồi push PR"
---

# /fix-issues — Auto-Fix AI Review Issues (Local Agent)

> **Khác biệt cốt lõi:** CI chỉ phát hiện lỗi. Agent LOCAL (bạn) mới là người sửa —
> vì ở local có full codebase, chạy được test, và có Self-Healing Loop.

---

## Giai đoạn 1: Fetch Issues từ GitHub

```
🤖 Đang tìm issues có label `auto-fixable` trên GitHub...
```

### Bước 1.1: Lấy danh sách issues

```bash
gh issue list --label "auto-fixable" --state open --json number,title,body,labels --limit 10
```

### Bước 1.2: Parse metadata từ issue body

Mỗi issue được tạo bởi AI PR Review có block metadata YAML:

```yaml
source: ai-pr-review
pr: <number>
file: <path>
severity: <security|critical|bug>
auto_fixable: true
```

Đọc và extract:

- `file` → file cần sửa
- `severity` → mức độ ưu tiên
- `Finding` section → mô tả lỗi chi tiết
- `Diff Context` → context code gốc

### Bước 1.3: Hiển thị tổng quan cho user

```
📋 Tìm thấy N issue(s) cần fix:

| # | Severity | File | Title |
|---|----------|------|-------|
| 1 | 🔴 SECURITY | src/auth.ts | SQL injection in login query |
| 2 | 🟡 BUG | src/api/users.ts | N+1 query in user list |

Bắt đầu fix tất cả? (Y/n)
```

> **Nếu user gõ `/fix-issues` không có tham số** → fix TẤT CẢ issues.
> **Nếu user gõ `/fix-issues #42`** → fix CHỈ issue #42.

---

## Giai đoạn 2: Fix từng Issue (Self-Healing Loop)

Với MỖI issue, thực hiện:

### Bước 2.1: Tạo branch

```bash
git checkout -b fix/ai-review-issue-<number>
```

### Bước 2.2: Đọc file và context

1. Đọc file gốc bằng `view_file`
2. Đọc issue body để hiểu lỗi cụ thể
3. `recall()` từ Second Brain — kiểm tra lỗi tương tự đã từng xảy ra chưa

### Bước 2.3: Fix code

- Sử dụng `replace_file_content` hoặc `multi_replace_file_content` để sửa
- **KHÔNG viết lại toàn bộ file** — chỉ sửa đúng phần bị lỗi
- Tuân thủ coding standards từ `AGENTS.md`

### Bước 2.4: Self-Healing Loop (Tối đa 3 lần)

```
Lần 1: Sửa code → Chạy test → Pass? → Tiếp tục
                               → Fail? → Đọc log lỗi → Sửa lại (lần 2)
Lần 2: Sửa code → Chạy test → Pass? → Tiếp tục
                               → Fail? → Sửa lại (lần 3)
Lần 3: Sửa code → Chạy test → Pass? → Tiếp tục
                               → Fail? → ⚠️ Escalate cho user
```

```bash
# Chạy lint
npm run lint 2>&1

# Chạy test (nếu có)
npm test 2>&1
```

### Bước 2.5: Commit và Push

```bash
git add .
git commit -m "🤖 Fix #<issue_number>: <mô tả ngắn>"
git push origin fix/ai-review-issue-<number>
```

> **Quan trọng:** Commit message PHẢI chứa `Fix #<number>` hoặc `Fixes #<number>`
> để GitHub tự động đóng issue khi PR được merge.

### Bước 2.6: Tạo PR

```bash
gh pr create \
  --title "🤖 Auto-fix: <issue title>" \
  --body "Fixes #<issue_number>\n\nAuto-fixed by local AI agent.\n\n## Changes\n<mô tả thay đổi>" \
  --label "ai-auto-fix"
```

### Bước 2.7: Lưu bài học vào Second Brain

```
remember(
  topic: "Fixed <mô tả lỗi>",
  detail: "Root cause: ... Fix: ... Prevention: ...",
  tags: ["bugfix", "<severity>", "<file>"]
)
```

---

## Giai đoạn 3: Tổng kết

```
✅ Auto-Fix Complete!

| Issue | Status | Branch | PR |
|-------|--------|--------|----|
| #42 | ✅ Fixed | fix/ai-review-issue-42 | #45 |
| #43 | ✅ Fixed | fix/ai-review-issue-43 | #46 |
| #44 | ⚠️ Escalated | — | — |

📝 Bài học đã lưu vào Second Brain: 2 entries

Tiếp theo:
  - Review các PR vừa tạo trên GitHub
  - Merge nếu CI pass
  - Issues sẽ tự đóng khi PR merged
```

---

## Luồng End-to-End

```
┌─── CI (GitHub Actions) ──────────────────────────────────────┐
│                                                               │
│  PR submitted → AI Review (Gemini) → Phát hiện lỗi           │
│  → Comment review trên PR                                     │
│  → Tạo GitHub Issues (structured, label: auto-fixable)        │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼  (User gõ /fix-issues)
┌─── LOCAL (Máy bạn) ──────────────────────────────────────────┐
│                                                               │
│  Antigravity/Claude (full codebase context)                   │
│  → Fetch issues từ GitHub                                     │
│  → Đọc file gốc + hiểu context toàn bộ project               │
│  → Fix code (chỉ sửa phần lỗi, không viết lại file)          │
│  → Chạy test + Self-Healing Loop (3 lần)                      │
│  → Commit "Fixes #42" → Push → Tạo PR                        │
│  → Lưu bài học vào Second Brain                               │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼  (PR merged)
┌─── GitHub ────────────────────────────────────────────────────┐
│                                                               │
│  PR merged → Issue #42 tự động đóng                           │
│  → AI Review chạy lại trên PR mới → Verify fix               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Edge Cases

| Tình huống                        | Xử lý                                                          |
| --------------------------------- | -------------------------------------------------------------- |
| Không có `gh` CLI                 | Hướng dẫn cài: `winget install GitHub.cli` rồi `gh auth login` |
| Issue đã bị close                 | Bỏ qua, thông báo user                                         |
| File trong issue đã bị xóa/rename | Bỏ qua, comment trên issue                                     |
| Test fail sau 3 lần               | Escalate — hiển thị log lỗi cho user quyết định                |
| Không có test runner              | Chỉ chạy lint, cảnh báo user                                   |

---

### 📡 Teleport Hook (Auto)

If `../teleport/` exists and user is AFK:

```bash
node ../teleport/scripts/send-telegram.mjs "<emoji> *<Agent> on fix-issues:*
✅ Fixed: {fixed_count} issues
⚠️ Escalated: {escalated_count} issues
📝 PRs created: {pr_list}"
```

Then start reply listener per `@[skills/teleport-bridge]`.
