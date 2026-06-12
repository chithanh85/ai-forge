# Validation Report

> Template chắt lọc từ [repository-harness](https://github.com/hoangnb24/repository-harness).
> Dùng khi cần báo cáo kiểm thử chi tiết hơn `verification.json` artifact.

**Date:** YYYY-MM-DD
**Run ID:** `<run-id>`
**Plan:** `docs/plans/active/<feature-slug>/`

## Scope

Story hoặc thay đổi nào được validate?

## Commands Run

```text
pnpm lint
pnpm test
python .agent/scripts/checklist.py .
```

## Results

| Check                     | Result                       | Notes                   |
| ------------------------- | ---------------------------- | ----------------------- |
| Lint                      | pass / fail                  |                         |
| TypeCheck                 | pass / fail                  |                         |
| Unit Tests                | pass / fail                  | X/Y passed              |
| Integration Tests         | pass / fail / not applicable |                         |
| E2E Tests                 | pass / fail / not applicable |                         |
| Checklist (artifact gate) | pass / fail                  |                         |
| Security Audit (`/audit`) | pass / warn / fail           | Only for High-Risk lane |

## Acceptance Criteria Verification

| AC # | Given-When-Then              | Verified | Evidence                          |
| ---- | ---------------------------- | -------- | --------------------------------- |
| AC-1 | _Given..., When..., Then..._ | ✅ / ❌  | _Link to test file or screenshot_ |
| AC-2 |                              |          |                                   |

## Known Issues

- _Liệt kê bất kỳ issue đã biết nào tại thời điểm validation._

## Verdict

**PASS** / **WARN** / **FAIL**

> Link đến artifact: `.agent/artifacts/<run-id>/verification.json`
