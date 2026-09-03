# AWF Operations

This document covers routine repository operations after bootstrap.

## Command resolver

Canonical quality commands live in `.awf/manifest.json`.

```bash
node scripts/awf/exec.mjs install --root .
node scripts/awf/exec.mjs lint --root .
node scripts/awf/exec.mjs typecheck --root .
node scripts/awf/exec.mjs test --root .
node scripts/awf/exec.mjs build --root .
node scripts/awf/exec.mjs format --root .
```

Do not copy source-repository `npm` commands into a target project that uses another manager.

## Sync adapters

```bash
node scripts/awf/sync.mjs --root .
```

Sync owns only the marked region in `AGENTS.md`, `GEMINI.md`, and `CLAUDE.md`.

Expected property:

```text
sync
sync again
=> no unexpected diff
```

If repeated sync creates churn, treat it as a generator bug.

## Doctor

```bash
node scripts/awf/doctor.mjs --root .
```

Doctor is a drift detector, not production certification. A high score does not replace project tests, security review, deployment validation, or a real application build.

## Core checklist vs artifact checklist

Core/bootstrap:

```bash
python .agent/scripts/checklist.py . --core
```

Normal task completion:

```bash
python .agent/scripts/checklist.py .
```

The normal path validates the artifact gate. Do not downgrade to `--core` because artifacts are inconvenient.

## Runtime artifacts

For a non-trivial run:

```text
.agent/artifacts/<run-id>/
  context-snippets.json
  risk-gate.json
  verification.json
  review-decision.json
  adversarial-validation.json
```

Artifacts are evidence, not prose decoration. Commands reported as passing should have actually run, and blocking review/risk decisions should stop completion.

## Checkpoints

`.agent/scripts/session_manager.py` maintains structured run checkpoints. `.agent/checkpoints/` is runtime state and is ignored by Git.

Checkpoint data should record enough information to resume or hand off work without inventing state from memory.

## Isolated worktrees

Use `.agent/scripts/worktree_runner.py` when write isolation materially improves safety, especially for concurrent or high-risk work.

Rules:

- worktrees stay under `.tmp/worktrees/`;
- unsafe roots are rejected;
- canonical-root dirtiness blocks execution by default;
- cleanup uses Git worktree operations rather than arbitrary recursive deletion;
- command exit status is recorded in the checkpoint.

## Updating AWF-owned configuration

When changing AWF core behavior:

1. update `.awf/policy/core.md` or the appropriate `scripts/awf/` implementation;
2. update relevant docs/tests;
3. run sync if adapter output changes;
4. run targeted tests;
5. run full lint/typecheck/test/wiki checks;
6. run `npm audit --audit-level=high` in the source repository;
7. run Doctor;
8. review Git diff before commit.

## Documentation maintenance

Current docs live under `docs/` and should be linked from `docs/README.md` or `docs/wiki-index.md` as appropriate.

Historical evidence belongs in dated lessons or `docs/plans/completed/`. Do not edit a historical record to pretend an old command/model choice never happened; mark it historical and point to the current contract.

## Technical debt ledger

Regenerate rather than hand-edit:

```bash
python scripts/maintenance/debt_scanner.py
```

Use strict mode only when the project's debt policy calls for it.

## Pre-push baseline for this source repository

```bash
npm run lint
npm run typecheck
npm test
npm run wiki:lint
npm audit --audit-level=high
node scripts/awf/doctor.mjs --root .
git diff --check
```

The source `build` command is a placeholder and should remain reported as not configured until AWF ships a real application artifact that needs building.
