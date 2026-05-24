---
trigger: "/clawpatch"
description: "🦀 Proactive AI code review & patching via Clawpatch semantic slicing"
---

# /clawpatch — Proactive Code Review & Patching

> **What:** Clawpatch maps your repo into semantic feature slices, reviews each slice with an AI provider, and can run an explicit fix loop for each finding.
> **Complement:** Works alongside `/fix-issues` (reactive, from CI) — `/clawpatch` is **proactive** (local, before commit).

---

## Prerequisites

```bash
# Install (one-time)
npm install -g clawpatch

# Verify
clawpatch --version   # should print ≥ 0.4.0
clawpatch doctor      # should show provider + version
```

---

## Giai đoạn 1: Init & Map

```
🦀 Đang map repo thành feature slices...
```

### Bước 1.1: Init (lần đầu)

```bash
clawpatch init
```

> Tạo `.clawpatch/` directory với config + project metadata.
> Nếu đã init rồi thì bỏ qua bước này.

### Bước 1.2: Map features

```bash
clawpatch map
```

> Quét repo, gom nhóm code thành "semantic feature slices" (routes, packages, scripts, configs...).
> Hiển thị kết quả cho user:

```
📊 Feature Map Complete:
  Features: {count}
  New: {new}
  Changed: {changed}
  Source: heuristic
```

---

## Giai đoạn 2: Review

### Bước 2.1: Chạy review

```bash
# Review với default provider (codex)
clawpatch review --limit 5 --jobs 3

# Hoặc chọn provider khác
clawpatch review --provider claude --limit 5
clawpatch review --provider mock --limit 3  # test only
```

### Bước 2.2: Xem report

```bash
clawpatch report
```

### Bước 2.3: Hiển thị tổng quan cho user

```
🔍 Review Complete:
  Reviewed: {count} features
  Findings: {findings_count}
  Report: .clawpatch/reports/{run_id}.md

| # | Severity | Feature | Finding |
|---|----------|---------|---------|
| 1 | 🔴 HIGH | auth-routes | SQL injection risk |
| 2 | 🟡 MEDIUM | user-service | Missing input validation |
```

---

## Giai đoạn 3: Triage & Fix

### Bước 3.1: Xem chi tiết finding

```bash
clawpatch show --finding <id>
```

### Bước 3.2: Triage (đánh dấu finding)

```bash
# Mark as false positive
clawpatch triage --finding <id> --status false-positive --note "covered by tests"

# Or accept for fixing
clawpatch triage --finding <id> --status accepted
```

### Bước 3.3: Fix (nếu user muốn)

> ⚠️ **Yêu cầu git worktree sạch** — commit hoặc stash trước.

```bash
clawpatch fix --finding <id>
```

> Fix loop chạy provider với workspace-write mode.
> Kết quả patch được lưu trong `.clawpatch/patches/`.
> **KHÔNG tự commit/push** — user phải review diff trước.

### Bước 3.4: Review diff & commit

```bash
git diff   # Review changes
git add .
git commit -m "🦀 Fix clawpatch finding: <mô tả>"
```

### Bước 3.5 (Optional): Tạo PR trực tiếp

```bash
clawpatch open-pr --patch <patchAttemptId> --draft
```

---

## Giai đoạn 4: Revalidate

Sau khi fix, chạy lại kiểm tra:

```bash
# Kiểm tra 1 finding
clawpatch revalidate --finding <id>

# Kiểm tra tất cả findings đang open
clawpatch revalidate --all --status open
```

---

## Giai đoạn 5: Tổng kết & Lưu bài học

```
✅ Clawpatch Session Complete!

| Metric | Value |
|--------|-------|
| Features mapped | {count} |
| Findings | {total} |
| Fixed | {fixed} |
| False positive | {fp} |
| Remaining | {remaining} |

📝 Report saved: .clawpatch/reports/{run_id}.md
```

### Lưu vào Second Brain

```
remember(
  topic: "Clawpatch review on {project} — {date}",
  detail: "Findings: {count}. Key issues: {summary}. Patterns: {patterns}",
  tags: ["clawpatch", "code-review", "proactive"]
)
```

---

## CI Mode

Để tích hợp vào CI pipeline:

```bash
clawpatch ci --since origin/main --output clawpatch-report.md
```

> Tự động: init → map → review → report → GitHub step summary.

---

## Kết hợp với AWF Workflows

| Scenario                   | Flow                                                    |
| -------------------------- | ------------------------------------------------------- |
| **Proactive local review** | `/clawpatch` → review → triage → fix locally            |
| **CI review → local fix**  | CI `clawpatch ci` → tạo issues → `/fix-issues`          |
| **Deep audit**             | `/audit` (vbs-scan-security) + `/clawpatch` (deslopify) |
| **Pre-deploy check**       | `/clawpatch review --mode deslopify` → `/deploy`        |

---

## Providers

| Provider        | Command             |
| --------------- | ------------------- |
| Codex (default) | `--provider codex`  |
| Claude Code     | `--provider claude` |
| Cursor          | `--provider cursor` |
| Grok            | `--provider grok`   |
| Mock (testing)  | `--provider mock`   |

---

## Edge Cases

| Tình huống               | Xử lý                                    |
| ------------------------ | ---------------------------------------- |
| Chưa cài clawpatch       | Hướng dẫn: `npm install -g clawpatch`    |
| Provider không có        | Chạy `clawpatch doctor` để kiểm tra      |
| Git worktree dirty (fix) | Yêu cầu commit/stash trước khi fix       |
| Quá nhiều findings       | Dùng `--limit` và `--severity` để filter |

---

### 📡 Teleport Hook (Auto)

If `../teleport/` exists and user is AFK:

```bash
node ../teleport/scripts/send-telegram.mjs "🦀 *Clawpatch on {project}:*
📊 Features: {features}
🔍 Findings: {findings}
🔴 High: {high} | 🟡 Medium: {medium}"
```
