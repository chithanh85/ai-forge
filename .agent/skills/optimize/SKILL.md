---
name: optimize
description: Autonomous performance, security, and quality code optimization loop using git ratchet (propose, evaluate, commit/revert).
allowed-tools: Read, Write, Edit, Command
version: 1.0
priority: IMPORTANT
auto-trigger: false
---

# Code Optimization Skill (Git Ratchet)

## Objective

Tự động hóa vòng lặp tối ưu hóa mã nguồn (tăng hiệu năng, vá lỗi bảo mật, giảm kích thước code, hoặc tối ưu hóa prompt) một cách an toàn thông qua cơ chế phản hồi định lượng (Git Ratchet).

Quy trình đảm bảo mọi cải tiến được lưu vết tự động qua git commits, trong khi mọi thay đổi lỗi hoặc thụt lùi hiệu năng sẽ bị revert lập tức để bảo vệ codebase.

---

## Execution Context

Chạy bên trong bất kỳ dự án nào tương thích với AWF Enterprise Template đã cấu hình sẵn script tối ưu hóa tại [optimize.mjs](file:///d:/Project/awf-enterprise-template/scripts/maintenance/optimize.mjs).

---

## Optimization Process

### 1. Khởi tạo (Initialization)

Đầu tiên, xác định tệp mục tiêu cần tối ưu hóa, lệnh benchmark đo hiệu năng (ví dụ: một script đo tốc độ thực thi, hoặc `pnpm bundle` đo kích thước), regex trích xuất metric và lệnh kiểm thử an toàn (`pnpm test` / `pnpm lint`).
Chạy lệnh khởi tạo để thiết lập branch tạm và ghi nhận baseline:

```bash
node scripts/maintenance/optimize.mjs init \
  --target <file_path> \
  --run-cmd "<benchmark_command>" \
  --metric-pattern "<regex_pattern>" \
  --direction <lower|higher> \
  --test-cmd "<test_command>"
```

_Lưu ý: Git working tree bắt buộc phải sạch (clean) trước khi chạy lệnh này._

### 2. Vòng lặp tối ưu hóa (Experiment Loop)

Lặp lại các bước sau:

- **Bước 1: Propose (Đề xuất)**: Phân tích code hiện tại, lập giả thuyết tối ưu hóa (ví dụ: thay đổi cấu trúc dữ liệu, tối ưu vòng lặp, thay đổi ORM queries).
- **Bước 2: Modify (Chỉnh sửa)**: Áp dụng các thay đổi vào tệp mục tiêu (`--target`). Không sửa đổi các tệp ngoài phạm vi đã đăng ký.
- **Bước 3: Evaluate (Đánh giá)**: Chạy lệnh đánh giá để script tự động benchmark, kiểm tra tính đúng đắn và quyết định commit hoặc rollback:
  ```bash
  node scripts/maintenance/optimize.mjs evaluate
  ```
- **Bước 4: Analyze (Phân tích kết quả)**:
  - Nếu kết quả trả về `accepted`: Đề xuất tiếp theo dựa trên phiên bản mới.
  - Nếu kết quả trả về `rejected`: Thay đổi đã bị hoàn tác (revert). Lập giả thuyết mới và thử nghiệm hướng đi khác.

### 3. Hoàn tất (Finish)

Khi đạt giới hạn số lần thử (budget) hoặc không thể tối ưu thêm, chạy lệnh hoàn tất để tự động merge các cải tiến vào nhánh chính và dọn dẹp môi trường:

```bash
node scripts/maintenance/optimize.mjs finish
```

---

## Anti-Patterns

- ❌ Chỉnh sửa nhiều tệp ngoài phạm vi đăng ký của `--target` mà không khai báo lại.
- ❌ Sử dụng các lệnh benchmark không ổn định (flaky) dẫn đến kết quả ratchet sai lệch.
- ❌ Bỏ qua cổng kiểm thử an toàn (`--test-cmd`) dẫn đến việc tối ưu hiệu năng làm hỏng tính đúng đắn của phần mềm.
