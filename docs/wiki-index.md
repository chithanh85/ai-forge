# AWF Knowledge Index

Agents use this index to locate **current** project/framework guidance. Historical lessons are listed separately and must not override current policy or docs.

## Current guidance

| Page                                                        | Type         | Purpose                                          |
| ----------------------------------------------------------- | ------------ | ------------------------------------------------ |
| [Documentation map](README.md)                              | index        | Current vs historical docs                       |
| [Architecture](ARCHITECTURE.md)                             | architecture | AWF v4.1 source-of-truth and adapter model       |
| [Getting Started](GETTING_STARTED.md)                       | operations   | Bootstrap and first verification                 |
| [Operations](OPERATIONS.md)                                 | operations   | Sync, doctor, artifacts, worktrees, maintenance  |
| [Integrations](INTEGRATIONS.md)                             | integration  | Optional capability trust boundaries             |
| [Feature Intake](FEATURE_INTAKE.md)                         | process      | Risk lanes and workflow routing                  |
| [Test Matrix](TEST_MATRIX.md)                               | process      | Behavior-to-proof traceability                   |
| [Decision template](templates/decision.md)                  | template     | Durable ADR format                               |
| [Validation report](templates/validation-report.md)         | template     | Evidence-oriented validation report              |
| [Code Review](wiki/conventions/code-review.md)              | convention   | Review priorities and trust rules                |
| [Fast Debugging](wiki/debugging-playbook/fast-debugging.md) | methodology  | Evidence-first debugging loop                    |
| [Antigravity adapter](wiki/antigravity.md)                  | integration  | Using AWF from Gemini/Antigravity-family clients |
| [Rune integration](wiki/integration/rune.md)                | integration  | Optional pinned Rune setup boundary              |

## Historical lessons

These pages record what happened at the time. They are not current operational contracts:

- [Template initialization (2026-05-20)](wiki/lessons/20260520-template-initialized.md)
- [Clawpatch integration (2026-05-24)](wiki/lessons/20260524-clawpatch-integration.md)
- [Session checkpointing and worktree runner (2026-05-28)](wiki/lessons/20260528-implemented-session-checkpointing-and-isolated-git-worktree-.md)

Historical implementation plans are under `plans/completed/`.

## Maintenance

After changing wiki/index links, run:

```bash
npm run wiki:lint
```

When current guidance conflicts with a historical lesson, follow `.awf/policy/core.md`, `.awf/manifest.json`, and the current docs.
