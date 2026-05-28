# AWF Artifact-Gated Approval

Each non-trivial `/plan`, `/code`, and `/debug` run writes approval artifacts under:

```text
.agent/artifacts/<run-id>/
```

`<run-id>` should be stable for the task, usually `YYYYMMDD-short-topic`.

## Required Artifacts

Every run directory must contain these five JSON files:

| File                          | Purpose                                                           | Blocking Conditions                                                                           |
| ----------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `context-snippets.json`       | Proves the agent read relevant files and captured enough context. | Missing file, invalid JSON, missing required fields, empty `sources`, credential-like values. |
| `risk-gate.json`              | Records blast radius and whether implementation may proceed.      | `decision: BLOCK`, unresolved High/Critical risk, credential-like values.                     |
| `verification.json`           | Records commands and manual checks used to prove completion.      | Empty `commands`, any command with `status` other than `pass`, credential-like values.        |
| `review-decision.json`        | Records review outcome.                                           | `decision: REQUEST_CHANGES` or `BLOCK`, unknown decision, credential-like values.             |
| `adversarial-validation.json` | Records Red Team and abuse-case validation.                       | `decision` other than `PASS`, credential-like values.                                         |

## Run Selection

`.agent/scripts/checklist.py` selects the artifact run in this order:

1. `AWF_ARTIFACT_RUN_ID`, resolved under `.agent/artifacts/`.
2. `.agent/artifacts/current`, as either a directory or a file containing a run id.
3. The latest modified child directory under `.agent/artifacts/`.

If no run directory exists, checklist fails closed and asks for artifacts to be created.

## Redaction

Artifacts must never contain unredacted credentials, environment values, cookies, private keys, or bearer values. Use `[REDACTED]` when evidence needs to mention a sensitive field. The checklist scans artifact keys and string values for credential-like patterns before approving a run.

## Minimal Example

```json
{
  "schema": "awf.risk-gate.v1",
  "run_id": "20260528-example",
  "risk": "LOW",
  "decision": "ALLOW",
  "blast_radius": {
    "gitnexus": "docs_only",
    "direct_callers": 0,
    "affected_processes": []
  },
  "blockers": [],
  "approval_required": false
}
```

## Relationship to Runtime Checkpoints

While **Artifacts** are the static, persistent compliance evidence check-ins required to approve commits/PRs, **Checkpoints** (`.agent/checkpoints/<run-id>/checkpoint.json`) are lightweight, ephemeral JSON state trackers used _during_ execution.

- **Checkpoints** capture real-time events, command history, worktree parameters, and active tasks. They are gitignored and remain local.
- **Artifacts** are written during the lifecycle phases and committed as long-term governance proof.
