# Historical Plan — Session Checkpointing and Git Worktree Isolation

**Created:** 2026-05-28
**Historical status:** Implemented
**Current contract:** [AWF Operations](../../OPERATIONS.md)

> This document is an archive record. Commands and tooling assumptions from the original implementation period are not current AWF defaults.

## Original problem

AWF needed two lightweight harness primitives without importing an entire external orchestration framework:

1. persistent runtime checkpoints so long-running agent work could be resumed, handed off and audited;
2. isolated Git worktrees so independent write tasks could avoid mutating the canonical working tree.

## Implemented primitives

### Session checkpoints

`.agent/scripts/session_manager.py` provides structured checkpoint state under:

```text
.agent/checkpoints/<run-id>/checkpoint.json
```

Checkpoint state is runtime-only and ignored by Git. It records run/agent identity, status, command evidence, worktree metadata and handoff-relevant state without dumping raw environment secrets.

### Git worktree runner

`.agent/scripts/worktree_runner.py` runs bounded commands in repo-owned worktrees under:

```text
.tmp/worktrees/<run-id>/
```

Current safety properties include:

- worktree roots outside `.tmp/worktrees/` are rejected;
- a dirty canonical root blocks execution by default unless deliberately allowed;
- cleanup uses Git worktree operations rather than arbitrary recursive deletion;
- child command exit status is preserved and checkpointed;
- failed commands can leave the worktree available for inspection.

## Relationship to task artifacts

Checkpoints and artifacts solve different problems:

- **checkpoint** = ephemeral execution/resume state;
- **artifact run** = task evidence used by completion/review gates.

A checkpoint may point to an artifact run, but one does not replace the other.

## What v4.1 changed

The original plan contained source-repo package-manager examples and stronger assumptions about specific code-intelligence tooling. v4.1 supersedes those assumptions:

- target-project commands come from `.awf/manifest.json`;
- Python executable use is portable across Windows and POSIX environments;
- optional code-intelligence capabilities improve analysis when available but are not required for core correctness;
- client/model orchestration remains outside these runtime primitives.

## Current proof

- `tests/session-checkpoint.test.ts`
- `tests/worktree-runner.test.ts`
- `.agent/scripts/session_manager.py`
- `.agent/scripts/worktree_runner.py`

These tests are the current proof surface; historical command transcripts are not.
