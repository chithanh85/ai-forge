# AWF Artifact-Gated Approval

Non-trivial plan/code/debug work may require structured evidence under:

```text
.agent/artifacts/<run-id>/
```

`<run-id>` should be stable for the task, for example `YYYYMMDD-short-topic`.

## Required artifacts

A gated run contains five JSON files:

| File                          | Purpose                                                        | Typical blocking conditions                           |
| ----------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| `context-snippets.json`       | Evidence that relevant repository context was inspected        | invalid/missing file, empty sources, secret-like data |
| `risk-gate.json`              | Risk/blast-radius decision before or during implementation     | blocking decision, unresolved high/critical risk      |
| `verification.json`           | Commands and checks proving the result                         | empty commands or any recorded failed command         |
| `review-decision.json`        | Independent/review outcome                                     | request-changes/blocking decision                     |
| `adversarial-validation.json` | Challenged assumptions, abuse cases and rationalization checks | non-PASS decision                                     |

Exact structure is defined by `.agent/schemas/artifacts/*.schema.json`; this README explains operational meaning rather than replacing the schemas.

## Core/bootstrap exception

A fresh project has no task artifact yet. Bootstrap therefore uses the explicit core verification mode:

```bash
python .agent/scripts/checklist.py . --core
```

Normal task completion should use:

```bash
python .agent/scripts/checklist.py .
```

Do not switch to `--core` merely to avoid creating required evidence for a real task.

## Run selection

The checklist selects the run in this order:

1. `AWF_ARTIFACT_RUN_ID`, resolved under `.agent/artifacts/`;
2. `.agent/artifacts/current`, when a project deliberately maintains that pointer;
3. latest modified child run directory.

The AWF distribution itself should not ship a maintainer's stale `current` pointer or historical run directory as if it were a new project's evidence.

## Redaction

Artifacts must never contain unredacted tokens, passwords, environment secrets, cookies, private keys or bearer values. Use `[REDACTED]` when evidence must mention a sensitive field.

The checklist scans artifact keys and values for credential-like patterns before approval.

## Risk-gate compatibility note

Schema `awf.risk-gate.v1` contains a legacy compatibility field named `blast_radius.gitnexus`. The field name does **not** make GitNexus a required runtime integration. When GitNexus is unavailable, record an honest value such as `unavailable_native_analysis` and derive callers/process impact using available repository-native evidence.

Example:

```json
{
  "schema": "awf.risk-gate.v1",
  "run_id": "20260903-docs",
  "risk": "LOW",
  "decision": "ALLOW",
  "blast_radius": {
    "gitnexus": "unavailable_native_analysis",
    "direct_callers": 0,
    "affected_processes": []
  },
  "blockers": [],
  "approval_required": false
}
```

A future schema version may rename that compatibility field; changing it in-place would break existing v1 artifacts and is therefore not a documentation-only change.

## Artifacts vs checkpoints

Artifacts and runtime checkpoints solve different problems:

- **Artifacts** are completion/review evidence for a task.
- **Checkpoints** under `.agent/checkpoints/<run-id>/checkpoint.json` are ephemeral execution/resume state.

Checkpoints may contain command history, worktree parameters and active-task state. They are ignored by Git. Artifacts belong to the current project/task and may be committed when the project's evidence policy requires it.
