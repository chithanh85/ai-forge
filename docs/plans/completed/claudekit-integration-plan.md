# Historical Plan — Guardrails and Artifact Gate Integration

**Created:** 2026-05-28
**Historical status:** Implemented, then consolidated into AWF v4.1
**Current contract:** [AWF v4.1 Architecture](../../ARCHITECTURE.md) and `.awf/policy/core.md`

> This document is an archive record. It is not a current operational runbook and must not override current AWF policy, manifest, workflows, or client adapters.

## Original problem

The earlier AWF workflow set had planning, debugging, testing and agent-role guidance, but it did not consistently enforce evidence before completion. The 2026-05-28 work introduced a stronger guardrail model around planning, debugging, verification and review.

## Durable outcomes

The work established concepts that remain part of AWF:

- scout and diagnose before claiming a root cause;
- a bounded plan contract with expected output, acceptance criteria, scope, constraints and touchpoints;
- structured task evidence under `.agent/artifacts/<run-id>/`;
- explicit risk decisions before high-risk changes;
- verification evidence rather than completion-by-assertion;
- independent review and adversarial/rationalization checks;
- fail-closed artifact validation for non-trivial task completion.

The original implementation used five task artifacts:

```text
context-snippets.json
risk-gate.json
verification.json
review-decision.json
adversarial-validation.json
```

Those artifacts remain documented in `.agent/artifacts/README.md` and tested by `tests/artifact-gate.test.ts`.

## What v4.1 changed

The original plan predated the Native Core architecture. Several assumptions from that period are now intentionally superseded:

- shared policy is no longer duplicated across client files; `.awf/policy/core.md` is canonical;
- `AGENTS.md`, `GEMINI.md`, and `CLAUDE.md` are thin managed adapters;
- package-manager commands are resolved through `.awf/manifest.json` rather than embedded in shared guidance;
- concrete model/provider choices belong to the active client/router/user;
- code-intelligence integrations are optional capabilities, not universal prerequisites;
- template-maintainer runtime artifacts are not shipped as new-project evidence.

## Current proof

Relevant executable proof includes:

- `tests/artifact-gate.test.ts`
- `tests/rationalization-table.test.ts`
- `tests/plan-review-gate.test.ts`
- `tests/plan-hydration.test.ts`
- `.agent/scripts/checklist.py`
- `.agent/schemas/artifacts/*.schema.json`

## Historical value

Keep this archive to explain **why** AWF has its present evidence/risk/review gates. For current commands or routing rules, read:

- `docs/FEATURE_INTAKE.md`
- `docs/OPERATIONS.md`
- `.awf/policy/core.md`
