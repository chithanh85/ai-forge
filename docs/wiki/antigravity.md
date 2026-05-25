# Google Antigravity Integration Wiki

Tài liệu này hướng dẫn cách cấu hình và sử dụng **Google Antigravity 2.0** và **Antigravity CLI** (`agy`) trong dự án Enterprise của bạn để tối ưu hóa hiệu năng điều phối đa agent song song và tự động hóa chu trình phát triển phần mềm (AWF).

## 🚀 Giới thiệu về Antigravity Ecosystem

- **Antigravity 2.0**: Hệ điều hành desktop độc lập dành cho AI Agents. Nó hỗ trợ chạy các sub-agents song song, quản lý file trong workspace mà không bị bó hẹp trong plugin của IDE.
- **Antigravity CLI (`agy`)**: Giao diện dòng lệnh chính thức thay thế cho Gemini CLI (kết thúc hỗ trợ ngày 18/06/2026). CLI này hỗ trợ các lệnh slash đặc biệt như `/goal` (chạy autopilot) và `/schedule` (hẹn giờ/cron job).

## 🛠️ Cấu hình Tích hợp

### 1. Model Context Protocol (`.mcp.json`)

Antigravity tự động tải các MCP servers cấu hình tại thư mục gốc của dự án. File mẫu chuẩn cho hệ sinh thái Enterprise:

```json
{
  "mcpServers": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    },
    "second-brain": {
      "command": "npx",
      "args": ["-y", "@google/second-brain-mcp@latest"],
      "env": {
        "BRAIN_STORAGE_PATH": "./second-brain"
      }
    }
  }
}
```

### 2. File Quy tắc Engine (`GEMINI.md`)

Quy định tập lệnh và hành vi an toàn mà Antigravity Agent Engine phải tuân theo khi bắt đầu session:

- **Routing**: Tự động nhận diện domain của task và chuyển cho Orchestrator định tuyến.
- **Self-Healing**: Thực thi kiểm thử và tự vá lỗi tối đa 3 lần.
- **Security Gate**: Bắt buộc quét mã nguồn với vbsec scanner trước khi hoàn thành task.

### 3. Quản lý trạng thái (`.planning/STATE.md`)

Trạng thái dự án đóng vai trò là "bản đồ" để agent định hướng khi chạy ngầm bằng CLI (lệnh `/goal`). Nó phải được cập nhật thường xuyên sau mỗi session.

## 💻 Hướng dẫn Chạy CLI (`agy`)

### 1. Autopilot Mode (`/goal`)

Khi bạn giao một mục tiêu lớn, agent CLI sẽ tự tạo kế hoạch chi tiết, chạy code, chạy test và tự sửa lỗi:

```bash
agy /goal "Tích hợp API thanh toán Stripe và viết đầy đủ unit tests"
```

### 2. Scheduled Task (`/schedule`)

Bạn có thể thiết lập lịch hẹn giờ hoặc chạy định kỳ (cron) để agent thực hiện nhiệm vụ ngầm (ví dụ: quét lỗ hổng bảo mật hàng ngày):

```bash
agy /schedule --cron "0 0 * * *" --prompt "Chạy quét bảo mật /audit trên toàn bộ codebase và ghi kết quả báo cáo"
```
