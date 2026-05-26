# Code Review Conventions

Quy trình và tiêu chuẩn Code Review tại dự án được xây dựng dựa trên cảm hứng từ bộ quy chuẩn **Google Engineering Practices**, nhằm đảm bảo vận tốc phát triển tối ưu nhưng vẫn duy trì chất lượng hệ thống và an toàn bảo mật.

---

## ⚖️ Tiêu chuẩn Review (The Standard of Review)

Triết lý cốt lõi khi review code (cho cả Con người và AI Agents):

- **Cải tiến hệ thống > Sự hoàn hảo tuyệt đối:** Reviewer không nên bắt bẻ phong cách cá nhân nếu code hoạt động đúng và an toàn. Hãy duyệt (Approve) PR nếu nó cải thiện chất lượng tổng thể của codebase.
- **Tốc độ là chìa khóa:** Reviewer cần phản hồi nhanh chóng (trong vòng vài giờ) để tránh làm nghẽn dòng chảy công việc.

---

## 📏 Kích thước PR (PR Size Guidelines)

- **PR siêu nhỏ (Small PRs):** Khuyến nghị mỗi PR giải quyết **một nhiệm vụ duy nhất** và có kích thước **dưới 200 dòng code**.
- **Lợi ích:** PR nhỏ giúp review cực kỳ nhanh, tăng độ chính xác phát hiện bug, dễ dàng review chéo, và đơn giản hóa quá trình rollback nếu xảy ra sự cố.

---

## 🏷️ Phân loại Comment (Comment Taxonomy)

Để việc giao tiếp hiệu quả và tránh tranh cãi vô ích, toàn bộ comment trong code review bắt buộc phải sử dụng một trong các tiền tố sau:

| Tiền tố             | Độ ưu tiên     | Mô tả & Quy định                                                                                                                       |
| :------------------ | :------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| **`🔴 BLOCKING`**   | **Bắt buộc**   | Lỗi bảo mật nghiêm trọng, bug có thể gây crash hệ thống, N+1 query, hoặc lỗi logic nặng. **PR không được merge khi chưa sửa lỗi này.** |
| **`🟡 SUGGESTION`** | **Gợi ý**      | Đề xuất tối ưu hiệu năng, cải thiện cấu trúc code sạch hơn. Tác giả tự quyết định áp dụng hoặc không, **không chặn việc merge.**       |
| **`🟢 NIT`**        | **Chuyện nhỏ** | Lỗi chính tả, format code, thiếu comment đơn giản. Reviewer tự sửa hoặc tác giả sửa nếu tiện tay, **không chặn merge.**                |
| **`❓ QUESTION`**   | **Câu hỏi**    | Câu hỏi để làm rõ thiết kế hoặc tìm hiểu thêm lý do tác giả viết code như vậy.                                                         |

---

## 🔒 Hàng rào Bảo mật (Security Trust Gate)

Hệ thống CI/CD PR Review tự động được cấu hình cơ chế bảo vệ để chống tấn công chuỗi cung ứng (supply-chain attack):

- **PR từ thành viên dự án (Internal PR):** AI CI sẽ review và tự động tạo các GitHub Issue có nhãn `auto-fixable` đối với các lỗi `🔴 BLOCKING`. Developer có thể chạy lệnh `/fix-issues` ở máy local để AI tự code và vá lỗi.
- **PR từ kho chứa Fork ngoài (External Fork PR):** AI CI chỉ đưa ra comment nhận xét trên PR để người quản lý dự án (Maintainer) duyệt thủ công. **Tuyệt đối không tạo issue auto-fix tự động** để tránh việc thực thi code độc hại trên môi trường local.
