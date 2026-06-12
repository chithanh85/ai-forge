# Feature Intake

> Chắt lọc từ [repository-harness/FEATURE_INTAKE.md](https://github.com/hoangnb24/repository-harness).
> Được điều chỉnh cho quy trình AWF — không dùng harness-cli, thay bằng AWF workflows.

Mọi yêu cầu từ user hoặc hệ thống đều phải đi qua cổng intake trước khi code.
Agent không cần hỏi user phân loại rủi ro — agent tự phân loại dựa trên checklist bên dưới.

## Intake Flow

```text
User prompt / request
    |
    v
Phân loại loại đầu vào (Input Type)
    |
    v
Diễn đạt lại thành work item rõ ràng
    |
    v
Tìm affected files, docs, plans, tests
    |
    v
Chạy Risk Checklist (7 câu hỏi)
    |
    v
Chọn làn: Tiny, Normal, hoặc High-Risk
    |
    v
Áp dụng workflow tương ứng
```

## Input Types

Xác định loại đầu vào trước khi chọn làn rủi ro.

| Loại                    | Khi nào dùng                               | Artifact đầu ra                 |
| ----------------------- | ------------------------------------------ | ------------------------------- |
| **New feature**         | Tính năng mới, chưa có spec                | Plan trong `docs/plans/active/` |
| **Change request**      | Sửa, tinh chỉnh hành vi đã chấp nhận       | Plan hoặc patch trực tiếp       |
| **Bug fix**             | Sửa lỗi phát hiện qua test hoặc production | Scout & Diagnose → patch        |
| **Maintenance**         | Nâng dependency, refactor nội bộ, config   | Plan hoặc patch trực tiếp       |
| **Docs update**         | Cập nhật wiki, README, ADR                 | Patch trực tiếp                 |
| **Harness improvement** | Cải thiện workflow, skill, agent rules     | Patch trực tiếp + wiki lesson   |

Không mở rộng spec monolithic. Dùng `docs/plans/`, `docs/adr/`, và `docs/wiki/lessons/` làm bề mặt sống (living surface).

## Risk Checklist (7 Câu Hỏi)

Agent tự trả lời 7 câu hỏi dưới đây. Mỗi câu "Có" = +1 điểm rủi ro.

| #   | Câu hỏi                                                           | Nếu "Có" |
| --- | ----------------------------------------------------------------- | -------- |
| 1   | Thay đổi database schema (bảng, cột, index, migration)?           | +1       |
| 2   | Thay đổi API contract (endpoint, request/response shape, auth)?   | +1       |
| 3   | Ảnh hưởng đến logic thanh toán, billing, hoặc tài chính?          | +1       |
| 4   | Sửa hoặc thay thế thư viện auth/security (JWT, RBAC, encryption)? | +1       |
| 5   | Ảnh hưởng đến hơn 5 file hoặc hơn 2 domain boundaries?            | +1       |
| 6   | Cần migration dữ liệu trên môi trường production?                 | +1       |
| 7   | GitNexus `impact` trả về risk HIGH hoặc CRITICAL?                 | +1       |

**Phân làn:**

- **0 điểm** → Tiny
- **1–2 điểm** → Normal
- **3+ điểm** → High-Risk

## Lanes

### Tiny Lane (0 điểm rủi ro)

Dùng cho: typo, thêm comment, cập nhật docs, đổi tên biến nội bộ, config nhỏ, thêm endpoint smoke/health đơn giản.

**Quy tắc:**

- Ghi nhận intake classification trước khi code (kickoff line đủ).
- Cho phép patch trực tiếp, không cần tạo plan file.
- Chạy lint + test bình thường.
- Cập nhật `docs/TEST_MATRIX.md` nếu thêm behavior mới.
- Không bắt buộc tạo Git Worktree.
- `--fast` flag được phép dùng thoải mái.

**AWF Workflow:** `/code --fast` hoặc sửa trực tiếp.

### Normal Lane (1–2 điểm rủi ro)

Dùng cho: thêm API endpoint, sửa giao diện, thay đổi business logic đơn giản, thêm tính năng mới trong phạm vi hẹp.

**Quy tắc:**

- Bắt buộc tạo plan (`/plan` hoặc `/plan --fast`).
- Bắt buộc plan contract 5 thành phần (Expected output, AC, Scope, Constraints, Touchpoints).
- Tạo Git Worktree nếu task có write isolation requirement.
- TDD mandatory (Red-Green-Refactor).
- Cập nhật `docs/TEST_MATRIX.md` khi hoàn thành.
- Artifact gate 5 JSON files bắt buộc khi đóng run.

**AWF Workflow:** `/plan` → `/code`

### High-Risk Lane (3+ điểm rủi ro)

Dùng cho: sửa DB schema, thay thế auth library, migration production data, thay đổi core domain logic.

**Quy tắc:**

- Bắt buộc chạy `/design` trước `/code`.
- Bắt buộc human approval tại `risk-gate.json` (agent không được tự approve).
- Kích hoạt `security-auditor` agent làm Red Team phản biện.
- GitNexus blast radius analysis bắt buộc trước khi sửa bất kỳ symbol nào.
- Git Worktree isolation bắt buộc.
- Sau khi code xong: `/audit` bắt buộc trước `/deploy`.
- Cập nhật `docs/TEST_MATRIX.md` + viết ADR nếu thay đổi kiến trúc.

**AWF Workflow:** `/plan` → `/design` → `/code` → `/test` → `/audit`

## Lane-to-Workflow Routing Table

| Lane          | Plan | Design |   Code   |   Test    | Audit | Worktree | Human Approval |
| :------------ | :--: | :----: | :------: | :-------: | :---: | :------: | :------------: |
| **Tiny**      |  —   |   —    | `--fast` | lint+test |   —   |    —     |       —        |
| **Normal**    |  ✅  |   —    |    ✅    |    ✅     |   —   | optional |       —        |
| **High-Risk** |  ✅  |   ✅   |    ✅    |    ✅     |  ✅   |    ✅    |       ✅       |

## Tích hợp với AWF Workflows

Orchestrator đọc file này khi tiếp nhận yêu cầu mới:

1. Phân loại input type.
2. Chạy Risk Checklist 7 câu hỏi.
3. Chọn lane.
4. Thông báo lane cho user: `"📋 Intake: [Normal Lane] — 2/7 risk factors detected."`
5. Áp dụng workflow chain tương ứng.

Khi user chạy `/code --fast` nhưng risk score ≥ 3, agent phải cảnh báo:

```
⚠️ Risk score 3/7 → High-Risk Lane. Khuyến nghị chạy /plan → /design → /code thay vì --fast.
Bạn muốn tiếp tục với --fast hay chuyển sang Normal/High-Risk flow?
```
