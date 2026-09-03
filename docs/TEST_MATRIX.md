# Test Matrix

This file maps important AWF framework behavior to executable proof. Projects may extend it with their own product behaviors after bootstrap.

Do not mark a behavior implemented because code exists; point to a test or validation path that proves the contract.

## Status values

| Status        | Meaning                                          |
| ------------- | ------------------------------------------------ |
| `planned`     | Desired behavior accepted, proof not implemented |
| `in_progress` | Implementation/proof is being built              |
| `implemented` | Behavior exists and proof passes                 |
| `changed`     | Contract changed and evidence needs review       |
| `retired`     | No longer part of the contract                   |

## AWF v4.1 framework matrix

| Behavior                                                                          | Proof                                                        | Status        |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------- |
| Native init hydrates project identity and manifest                                | `tests/native-bootstrap.test.ts`                             | `implemented` |
| Existing package manager is detected and repeated init is idempotent              | `tests/native-bootstrap.test.ts`                             | `implemented` |
| Launchers are anchored to their script directory and Bash detects Python portably | `tests/native-bootstrap.test.ts` + fresh Windows/Linux smoke | `implemented` |
| Rationalization-prevention rule is referenced by adapters/workflows               | `tests/rationalization-table.test.ts`                        | `implemented` |
| Artifact gate fails closed and bootstrap can explicitly use core mode             | `tests/artifact-gate.test.ts`                                | `implemented` |
| Plan hydration and phase state are deterministic                                  | `tests/plan-hydration.test.ts`                               | `implemented` |
| Review gate blocks low-score/blocking reviewer outcomes                           | `tests/plan-review-gate.test.ts`                             | `implemented` |
| Session checkpoint commands persist structured state                              | `tests/session-checkpoint.test.ts`                           | `implemented` |
| Git worktree runner isolates writes and preserves exit semantics                  | `tests/worktree-runner.test.ts`                              | `implemented` |
| Wiki strict/changed validation works                                              | `tests/wiki-lint.test.ts`                                    | `implemented` |
| Optimizer ratchet handles improve/regress/dirty states                            | `tests/optimize.test.ts`                                     | `implemented` |
| CI review parser enforces strict review JSON/policy behavior                      | `tests/ci/review-parser.test.mjs`                            | `implemented` |

## Project extension table

Append project-specific behavior below this line rather than deleting the AWF framework rows.

| Story / feature | Contract                              | Unit | Integration | E2E | Platform          | Status    | Evidence / run-id    |
| --------------- | ------------------------------------- | ---- | ----------- | --- | ----------------- | --------- | -------------------- |
| _example_       | _Given/When/Then or concise behavior_ | —    | —           | —   | _api/web/cli/..._ | `planned` | _artifact/test path_ |

Legend: ✅ proof exists and passes; ❌ proof exists and fails; — not applicable/not yet implemented.

## Update rules

1. Add a row when externally meaningful behavior changes or a durable framework contract is added.
2. Do not use this matrix for every internal refactor.
3. Do not delete historical contract rows merely because behavior changed; use `changed` or `retired` where traceability matters.
4. Prefer test-file or artifact references that another reviewer can actually inspect.
5. The checklist does not currently parse this table as an enforcement gate; it is a human/agent traceability surface.
