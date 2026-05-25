---
trigger: "/code-pro"
description: "🚀 Actor-Critic Coding (Codex Plan + Antigravity Code + Codex Review & Patch)"
---

# /code-pro — Actor-Critic Coding Workflow

Workflow này hiện thực hóa sự phối hợp đa agent tối ưu: **Codex** đảm nhận vai trò **Tech Lead & Architect** (Lên kế hoạch và kiểm duyệt chất lượng), trong khi **Antigravity (Gemini)** đảm nhận vai trò **Junior Dev** (Tập trung viết code thô dựa trên kế hoạch chi tiết).

---

## 🔄 Quy trình Triển khai (End-to-End)

```
[User Request]
      │
      ▼
┌──────────────┐
│  Phase 1:    │ ➔ Gọi Codex CLI lập kế hoạch chi tiết
│  PLANNING    │   Sinh file docs/plans/<feature>-plan.md
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Phase 2:    │ ➔ Antigravity (Gemini) đọc plan, viết code thô
│  CODING      │   và xây dựng các unit test theo mô hình TDD
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Phase 3:    │ ➔ Chạy `clawpatch review` ngầm
│  REVIEW      │   Codex review code và tự vá lỗi qua các bản patch (.patch)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Phase 4:    │ ➔ Chạy pnpm run audit (Lint + TypeCheck + Test)
│  VERIFY      │   Commit, push remote và lưu bài học vào Second Brain
└──────────────┘
```

---

## 📋 Chi tiết các Giai đoạn

### Phase 1: Planning (Codex - Tech Lead)

Khi bạn gõ `/code-pro <yêu cầu tính năng>`, hệ thống sẽ gọi ngầm **Codex CLI** ở chế độ non-interactive để phân tích kiến trúc và sinh kế hoạch chi tiết:

```bash
echo "" | codex exec -m gpt-5.5 -s danger-full-access --dangerously-bypass-approvals-and-sandbox --dangerously-bypass-hook-trust "Hãy phân tích yêu cầu: '<yêu cầu tính năng>'. Hãy tạo file kế hoạch docs/plans/<feature>-plan.md chi tiết, quy định rõ cấu trúc dữ liệu, các hàm cần viết trong file nào, tham số truyền vào và các test case cụ thể."
```

### Phase 2: Coding (Antigravity - Junior Coder)

Antigravity (Gemini) tiếp quản task:

1. Đọc file kế hoạch `docs/plans/<feature>-plan.md`.
2. Truy xuất bài học kinh nghiệm từ Second Brain để tránh lỗi lặp lại.
3. Thực hiện lập trình TDD:
   - **RED**: Viết unit test lỗi trước để định hình hành vi.
   - **GREEN**: Viết mã nguồn tối giản trong file thực tế để test pass.
   - **REFACTOR**: Tinh chỉnh cấu trúc code nhưng vẫn giữ test xanh.

### Phase 3: Review & Refine (Codex - Tech Lead Review)

Sau khi Antigravity hoàn thành viết code, hệ thống tự động kích hoạt **Clawpatch** chạy ngầm để Codex review chéo kết quả:

```bash
# 1. Ánh xạ lại các feature slices mới
clawpatch map

# 2. Codex review chéo các file vừa sửa đổi
clawpatch review --limit 5

# 3. Tạo bản vá tự động cho các phát hiện lỗi (findings)
# Các bản vá được lưu tại .clawpatch/patches/
clawpatch fix --all
```

_Nếu có bản vá (`.patch`), Antigravity sẽ hiển thị diff cho bạn xem trước khi apply._

### Phase 4: Verification & Handoff

1. Chạy xác thực cuối cùng:
   ```bash
   pnpm run audit
   ```
2. Commit mã nguồn với conventional commit:
   `feat: <mô tả> (implemented via /code-pro)`
3. Lưu bài học vào Second Brain chung để cả hai agent cùng học tập:
   ```bash
   # Lưu bài học
   python .agent/skills/auto-memory/scripts/local_brain.py remember \
     "Code-Pro: Implemented <feature>" \
     "Architectured by Codex, Coded by Antigravity, Audited by Clawpatch" \
     --tags codepro multiagent implementation
   ```

---

## 📡 Teleport Hook (Auto)

Khi chạy xong toàn bộ luồng, nếu bạn đang AFK, kết quả tổng hợp sẽ được gửi về Telegram:

```bash
node ../teleport/scripts/send-telegram.mjs "🚀 *Code-Pro Workflow Complete:*
✅ Codex Plan generated
✅ Antigravity code written
🔍 Clawpatch audited by Codex
🔒 Security & Tests: PASS"
```
