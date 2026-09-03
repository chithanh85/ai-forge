# Code Review Conventions

AWF review aims to improve repository correctness, safety and maintainability without turning style preferences into blockers.

## Review order

Review in this order:

1. correctness and data loss;
2. security and trust boundaries;
3. contract/backward compatibility;
4. tests and missing evidence;
5. concurrency/performance/resource risks;
6. maintainability and unnecessary complexity;
7. style/nits last.

## Comment taxonomy

| Prefix       | Meaning                                            | Merge impact                               |
| ------------ | -------------------------------------------------- | ------------------------------------------ |
| `BLOCKING`   | Correctness, security, data-loss or contract issue | must resolve before merge                  |
| `SUGGESTION` | Improvement with meaningful value                  | non-blocking unless promoted with evidence |
| `QUESTION`   | Missing rationale/evidence or design clarification | resolve enough to remove ambiguity         |
| `NIT`        | Minor readability/style preference                 | non-blocking                               |

Automatable formatting should be handled by formatter/linter rather than repeated review comments.

## Review scope

Prefer reviewable, cohesive changes. There is no universal line-count limit: a generated lockfile or mechanical rename can be large while a small auth change can be high-risk.

When a diff is large, split by independent behavior/contract where that improves review quality. Do not split changes in a way that makes intermediate commits misleading or broken.

## Evidence

A reviewer should inspect relevant tests, validation artifacts, Git diff and risk context rather than accepting an implementation agent's completion claim.

For non-trivial AWF runs, review `verification.json`, `review-decision.json`, `risk-gate.json`, and adversarial evidence when required.

## Independent review

An independent reviewer is valuable when the blast radius or uncertainty is meaningful. Independence means a separate review perspective; it does not require a specific provider/model.

## Security trust boundary

Treat external/fork code and generated patches as untrusted.

Automated review/auto-fix systems must not turn untrusted PR content into privileged local code execution merely because an AI reviewer found an issue. Keep secrets unavailable to untrusted fork workflows and require explicit maintainer control for privileged write/fix automation.

## Approval standard

Approve when the change improves the codebase and all blocking issues are resolved with sufficient evidence. Do not hold a correct bounded change hostage to personal style preferences.
