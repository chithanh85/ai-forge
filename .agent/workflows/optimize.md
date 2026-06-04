---
trigger: "/optimize"
description: "Quantitative performance, security, and quality code optimization loop using git ratchet."
---

# /optimize — Code Optimization Workflow (Git Ratchet)

Workflow này hướng dẫn AI thực hiện tối ưu hóa tự động các khía cạnh hiệu năng (Performance), bảo mật (Security), kích thước mã nguồn hoặc Prompts của hệ thống dựa trên cơ chế phản hồi định lượng (Git Ratchet).

---

## 🔄 Quy trình Triển khai (End-to-End)

```
 [User Request]
       │
       ▼
 ┌──────────────┐
 │  Phase 1:    │ ➔ Xác định mục tiêu, benchmark command
 │  PREFLIGHT   │   và metric đo lường.
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │  Phase 2:    │ ➔ Khởi tạo môi trường ratchet
 │  SETUP       │   Chạy: node scripts/maintenance/optimize.mjs init ...
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │  Phase 3:    │ ➔ Vòng lặp tối ưu (Lặp lại max 5-10 lần):
 │  EXPERIMENT  │   AI sửa file -> Chạy: node scripts/maintenance/optimize.mjs evaluate
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │  Phase 4:    │ ➔ Hoàn tất tối ưu hóa và dọn dẹp branch
 │  VERIFY      │   Chạy: node scripts/maintenance/optimize.mjs finish
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │  Phase 5:    │ ➔ Ghi nhớ kết quả đo lường và bài học vào
 │  HANDOFF     │   Second Brain + Cập nhật STATE.md.
 └──────────────┘
```

---

## 📋 Chi tiết các Giai đoạn

### Phase 1: Preflight & Định nghĩa Scope

1. Phân tích yêu cầu tối ưu hóa từ người dùng để xác định:
   - **Target File**: Tệp tin cần được tối ưu.
   - **Benchmark Command**: Lệnh để đo đạc chỉ số hiệu năng (ví dụ: `node scripts/bench.js`).
   - **Metric Pattern**: Regex để lấy giá trị số từ kết quả benchmark (ví dụ: `Execution time: (\d+)ms` hoặc `Bundle Size: (\d+)KB`).
   - **Optimize Direction**: Hướng cải tiến (`lower` đối với thời gian/kích thước, `higher` đối với điểm số/throughput).
   - **Safety Test Command**: Lệnh chạy kiểm thử đảm bảo tính đúng đắn (ví dụ: `pnpm test`).

### Phase 2: Setup & Khởi tạo

1. Đảm bảo trạng thái Git hiện tại là sạch sẽ (clean).
2. Chạy lệnh khởi tạo môi trường cách ly (Temporary branch):
   ```bash
   node scripts/maintenance/optimize.mjs init \
     --target <target_file> \
     --run-cmd "<benchmark_command>" \
     --metric-pattern "<regex_pattern>" \
     --direction <lower|higher> \
     --test-cmd "<test_command>"
   ```
3. Nhận kết quả baseline và ghi nhận chỉ số đo ban đầu.

### Phase 3: Experiment Loop (Vòng lặp thử nghiệm)

Thực hiện tối đa 5-10 lượt tối ưu (hoặc theo giới hạn thời gian/iterations được yêu cầu):

1. **Lập Giả thuyết (Propose)**: Nghĩ phương án cải tiến code và ghi chú nhanh lý do chọn phương án đó.
2. **Chỉnh sửa (Modify)**: Sửa đổi tệp tin mục tiêu (`--target`).
3. **Đánh giá (Evaluate)**: Chạy lệnh đánh giá tự động:
   ```bash
   node scripts/maintenance/optimize.mjs evaluate
   ```
4. **Phân tích kết quả**:
   - Nếu output báo `accepted` (metric được cải thiện và pass test): Ghi nhận thành công, lấy điểm số mới làm baseline tiếp theo để cải tiến tiếp.
   - Nếu output báo `rejected` (thụt lùi hoặc test hỏng): Thay đổi bị rollback tự động. Đổi phương án khác và thử lại.

### Phase 4: Verification & Merge

1. Sau khi hoàn thành, chạy lệnh kết thúc để tự động merge code cải tiến vào nhánh chính và dọn dẹp branch cách ly:
   ```bash
   node scripts/maintenance/optimize.mjs finish
   ```
2. Lưu kết quả thống kê cuối cùng (Baseline vs Best Metric, tỉ lệ cải thiện).

### Phase 5: Handoff & Lưu trữ Tri thức

1. Lưu bài học tối ưu hóa vào Second Brain để hệ thống ghi nhớ:

   ```bash
   # Nếu có MCP:
   mcp_second-brain_remember(
     content="Optimize: Cải tiến {target_file}. Baseline: {baseline} -> Best: {best}. Phương án: {phuong_an_thanh_cong}.",
     tags=["optimize", "performance", "lessons"]
   )

   # Nếu dùng Local Fallback:
   python .agent/skills/auto-memory/scripts/local_brain.py remember \
     "Optimize: Cải tiến {target_file}" \
     "Baseline: {baseline} -> Best: {best}. Phương án: {phuong_an_thanh_cong}." \
     --tags optimize performance lessons --type lesson
   ```

2. Cập nhật trạng thái trong `.planning/STATE.md`.
3. Báo cáo kết quả chi tiết kèm theo thông số benchmark trước/sau tối ưu cho người dùng.
