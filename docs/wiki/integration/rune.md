# Rune Skill Mesh Integration

[Rune](https://github.com/rune-kit/rune) là một hệ sinh thái kỹ thuật (Skill Mesh) dành cho AI Coding Assistants, giúp tăng cường tính kỷ luật của AI Agent, giảm lượng token tiêu thụ và đẩy nhanh tốc độ giải quyết các tác vụ phức tạp.

Dự án `awf-enterprise-template` hỗ trợ tích hợp Rune như một **tùy chọn nâng cấp cấu hình (Optional Integration)** thay vì nhúng cứng vào nhân để tránh làm phình to context window mặc định.

---

## 🚀 Hướng dẫn Kích hoạt (1-Click Setup)

Để cài đặt và cấu hình Rune cho workspace hiện tại, chạy script PowerShell sau:

```powershell
# Cài đặt Rune mặc định (free tier, preset gentle, project-level)
.\scripts\maintenance\setup-rune.ps1

# Cài đặt nâng cao với Pro/Business tier và chế độ strict chặn lỗi chặt chẽ
.\scripts\maintenance\setup-rune.ps1 -Preset strict -Tier pro

# Kích hoạt Rune ở phạm vi Global (áp dụng cho mọi phiên làm việc Claude Code của bạn)
.\scripts\maintenance\setup-rune.ps1 -Preset gentle -Tier free -Global
```

---

## 🏗️ Nguyên lý Hoạt động & Phối hợp

Khi Rune được kích hoạt, hệ thống sẽ chèn các Git Hooks tương thích vào AI CLI (Claude Code, Cursor, Antigravity, Codex):

```
       [User Lệnh]
           │
           ▼
┌───────────────────────┐
│     Rune Preflight    │ ➔ Kiểm duyệt cấu hình & môi trường (gentle/strict)
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│     AWF Workflow      │ ➔ Triển khai các workflow của AI Forge (/code, /test...)
└──────────┬────────────┘
           │ (Nếu gặp lỗi / bế tắc)
           ▼
┌───────────────────────┐
│    Rune Skill Mesh    │ ➔ Kích hoạt 64 liên kết cứu hộ (scout, adversary...)
└───────────────────────┘
```

- **Rune Preflight & Hooks:** Tự động kiểm tra tính toàn vẹn của mã nguồn, types, và môi trường trước khi AI thực hiện chỉnh sửa.
- **Fail-Over Mesh:** Nếu AI Agent cục bộ bị bế tắc (`agent.stuck` kích hoạt sau 3 giả thuyết debug sai), Rune sẽ gọi ngầm skill `adversary` để mở một Model thứ hai (Stateless) lấy ý kiến đánh giá độc lập (Second Opinion), bẻ gãy hiện tượng confirmation-bias (thiên kiến xác nhận) của AI.

---

## 🗺️ Bản đồ Ánh xạ Model (Model Adapter Mapping)

Rune v2.18+ hỗ trợ tự động dịch tên các model Anthropic sang các model tương đương của Google và OpenAI khi chạy trong môi trường tương ứng:

- **Google Antigravity Backend:**
  - `opus` ➔ `gemini-3-pro` (Model suy luận chuyên sâu)
  - `sonnet` ➔ `gemini-3-flash` (Model tốc độ cao, mặc định)
  - `haiku` ➔ `gemini-3-flash-lite` (Model siêu nhẹ)
- **OpenAI Codex Backend:**
  - `opus` ➔ `gpt-5-pro`
  - `sonnet` ➔ `gpt-5`
  - `haiku` ➔ `gpt-5-mini`

---

## 🔧 Quản lý và Gỡ lỗi (Maintenance & Doctor)

- Kiểm tra tình trạng hoạt động và cấu hình trôi lệch (drift) của các hooks:
  ```bash
  npx @rune-kit/rune doctor
  ```
- Gỡ bỏ hoàn toàn cấu hình Rune ra khỏi dự án:
  ```powershell
  .\scripts\maintenance\setup-rune.ps1 -Preset off
  ```
