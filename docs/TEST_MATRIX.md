# Test Matrix

> Chắt lọc từ [repository-harness/TEST_MATRIX.md](https://github.com/hoangnb24/repository-harness).
> Được điều chỉnh cho quy trình AWF — link đến `verification.json` artifacts thay vì `harness-cli`.

File này ánh xạ hành vi sản phẩm đến bằng chứng kiểm thử.

Không đánh dấu một hàng là `implemented` cho đến khi có test hoặc validation evidence thực sự tồn tại.

## Status Values

| Status        | Ý nghĩa                                           |
| ------------- | ------------------------------------------------- |
| `planned`     | Đã chấp nhận là hành vi mong muốn, chưa implement |
| `in_progress` | Đang được xây dựng                                |
| `implemented` | Đã implement và có proof tồn tại                  |
| `changed`     | Contract thay đổi sau khi đã implement trước đó   |
| `retired`     | Không còn là một phần của product contract        |

## Cách sử dụng

### Cho AI Agents

1. **Sau `/code`**: Khi hoàn thành implement một behavior mới, thêm hoặc cập nhật hàng tương ứng trong bảng Matrix bên dưới.
2. **Sau `/test`**: Cập nhật cột proof (Unit/Integration/E2E) khi test được viết và pass.
3. **Sau `/debug`**: Nếu fix bug thay đổi behavior, cập nhật status thành `changed`.
4. **Link Artifact**: Ghi `run-id` của artifact tương ứng trong cột AWF Artifact để truy vết.

### Cho Tech Lead

- Đọc bảng này để biết toàn cảnh coverage theo behavior.
- Hàng nào có status `planned` nhưng chưa có proof = gap cần đóng.
- Hàng nào có status `changed` = cần review lại test hiện tại.

## Matrix

| Story/Feature   | Contract (Behavior)                  | Unit | Integration | E2E | Platform | Status        | AWF Artifact    |
| --------------- | ------------------------------------ | ---- | ----------- | --- | -------- | ------------- | --------------- |
| _Ví dụ: US-001_ | _User đăng nhập bằng email/password_ | ✅   | ✅          | —   | web      | `implemented` | `20260601-auth` |
|                 |                                      |      |             |     |          |               |                 |

> **Ghi chú:**
>
> - ✅ = có test và pass
> - ❌ = có test nhưng fail
> - — = chưa có test / không áp dụng
> - Platform: `web`, `mobile`, `api`, `cli`, `worker`
> - AWF Artifact: `run-id` từ `.agent/artifacts/<run-id>/verification.json`

## Quy tắc Cập nhật

1. **Thêm hàng mới** khi implement behavior mới (không phải refactor nội bộ).
2. **Không xóa hàng** khi behavior thay đổi — đổi status sang `changed` hoặc `retired`.
3. **Một behavior = một hàng** — không gộp nhiều behaviors vào một hàng.
4. **Contract column** viết dưới dạng Given-When-Then hoặc mô tả ngắn gọn.
5. Agent chạy `python .agent/scripts/checklist.py .` không validate file này — đây là tài liệu tham khảo cho Tech Lead, không phải enforcement gate.
