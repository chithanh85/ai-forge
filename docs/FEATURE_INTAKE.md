# Feature Intake and Risk Lanes

Every substantive request should be classified before implementation. The user does not need to supply a risk label; the agent derives it from repository evidence and the checklist below.

## Intake flow

```text
request
  -> identify input type
  -> restate expected outcome
  -> inspect affected files/contracts/tests
  -> score risk factors
  -> choose Tiny / Normal / High-Risk lane
  -> execute the matching workflow
```

## Input types

| Type                 | Typical examples                            | Expected planning surface                      |
| -------------------- | ------------------------------------------- | ---------------------------------------------- |
| New feature          | New behavior or product capability          | plan required unless truly tiny                |
| Change request       | Change accepted behavior                    | plan or bounded patch                          |
| Bug fix              | Reproduce and correct a defect              | scout/diagnose + regression proof              |
| Maintenance          | Dependency/config/refactor work             | bounded plan when blast radius is non-trivial  |
| Documentation        | README/wiki/ADR/current docs                | direct patch if behavior is not changing       |
| AWF/framework change | Policy, workflow, skill, bootstrap, adapter | plan + framework verification when non-trivial |

Do not grow one permanent monolithic spec. Use current docs, plans, ADRs and durable lessons for the appropriate purpose.

## Risk checklist

Each applicable factor adds one point:

| #   | Risk factor                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------ |
| 1   | Database schema, migration, persistent-data contract changes                                           |
| 2   | Public/internal API contract, auth, protocol or compatibility changes                                  |
| 3   | Payment, billing, financial or irreversible business logic                                             |
| 4   | Security/authentication/authorization/cryptography changes                                             |
| 5   | Broad blast radius: more than about five files or multiple domain boundaries                           |
| 6   | Production data/runtime migration or deployment with difficult rollback                                |
| 7   | Impact analysis from available repository/code-intelligence tools indicates high/critical blast radius |

Use the score as a routing heuristic, not as permission to ignore an obvious severe risk.

- **0** → Tiny
- **1–2** → Normal
- **3+** → High-Risk

A single critical security or irreversible-production concern may justify High-Risk even with a lower numeric score.

## Tiny lane

Examples: typo, bounded docs update, internal rename, isolated config correction, small deterministic test-only change.

Rules:

- compact kickoff/plan is enough;
- direct patch is allowed;
- verify the changed behavior or documentation;
- do not create ceremony that costs more than the change;
- artifact gate may be unnecessary when the task is genuinely trivial and policy permits it.

Typical workflow: direct bounded change or `/code --fast` where the active client supports that workflow.

## Normal lane

Examples: a bounded feature, API endpoint, UI behavior, business-logic change, non-trivial framework update.

Rules:

- explicit plan with expected output, acceptance criteria, scope, constraints and touchpoints;
- regression/behavior tests where practical;
- normal lint/typecheck/test verification;
- update test-matrix evidence when product/framework behavior changes;
- use task artifacts when required by the workflow contract;
- worktree isolation is optional when it materially improves safety.

Typical flow:

```text
plan -> implementation -> verification -> review
```

## High-Risk lane

Examples: production migrations, auth/security changes, broad core-domain changes, large cross-domain refactors.

Rules:

- explicit plan and design before write implementation;
- blast-radius analysis using available native or optional code-intelligence tools;
- explicit risk approval where the risk gate requires a human decision;
- isolated worktree for risky/concurrent writes when available;
- independent review/adversarial validation;
- security audit before deploy/merge when applicable;
- ADR when architecture or durable contracts change;
- stronger rollback and smoke-test evidence.

Typical flow:

```text
plan -> design -> approval -> implementation -> test -> review -> audit
```

## Capability-aware routing

AWF does not require one specific MCP to classify risk. If GitNexus or another code-intelligence integration is available, use it when it materially improves impact analysis. If unavailable, use native repository search, symbol/call-site inspection, tests and Git history instead.

Parallel subagents are optional. Parallelize only independent work when the active client supports it safely; otherwise execute the same contract sequentially.

## User override

A user can deliberately ask for a faster or narrower path, but shared AWF policy must not silently bypass safety controls, required human approval, or verification evidence. If a requested shortcut conflicts with a blocking risk gate, explain the conflict and preserve the safety boundary.
