# Validation Report

**Date:** YYYY-MM-DD
**Run ID:** `<run-id>`
**Plan / issue:** `<path-or-reference>`

## Scope

What behavior/change is being validated, and what is explicitly out of scope?

## Environment

- OS/runtime:
- package manager:
- relevant service/data fixture:

## Commands run

Prefer logical AWF commands when configured:

```text
node scripts/awf/exec.mjs lint --root .
node scripts/awf/exec.mjs typecheck --root .
node scripts/awf/exec.mjs test --root .
<python3> .agent/scripts/checklist.py .
```

Record the actual commands executed if the target project uses different validation surfaces.

## Results

| Check             | Result                                 | Evidence / notes |
| ----------------- | -------------------------------------- | ---------------- |
| Lint              | pass / fail / n-a                      |                  |
| Typecheck         | pass / fail / n-a                      |                  |
| Unit tests        | pass / fail / n-a                      |                  |
| Integration tests | pass / fail / n-a                      |                  |
| E2E / smoke       | pass / fail / n-a                      |                  |
| Artifact gate     | pass / fail / n-a                      |                  |
| Security review   | pass / warn / fail / n-a               |                  |
| Build             | pass / fail / **NOT_CONFIGURED** / n-a |                  |

Never report a placeholder build as `pass`.

## Acceptance criteria

| AC   | Expected behavior | Verified | Evidence |
| ---- | ----------------- | -------- | -------- |
| AC-1 |                   | ✅ / ❌  |          |

## Adversarial checks

What assumptions, edge cases or rationalizations were challenged?

## Known limitations

List unresolved issues or evidence gaps. Do not hide them to obtain a PASS verdict.

## Verdict

**PASS** / **WARN** / **FAIL**

If task artifacts are required, reference `.agent/artifacts/<run-id>/verification.json` and the associated risk/review/adversarial artifacts.
