# Historical Lesson — Session Checkpointing and Isolated Git Worktrees

**Date:** 2026-05-28
**Type:** historical lesson
**Tags:** #harness #checkpointing #worktree

> Archive record. Current operational guidance lives in `docs/OPERATIONS.md`.

## Summary

AWF introduced two lightweight runtime primitives:

- structured session/run checkpoints through `.agent/scripts/session_manager.py`;
- isolated write execution through `.agent/scripts/worktree_runner.py` and Git worktrees under `.tmp/worktrees/`.

## Durable lesson

Long-running or concurrent agent execution needs explicit state and write isolation. Chat history alone is not a reliable runtime ledger, and parallel writers should not casually share the canonical working tree.

## Current proof

- `tests/session-checkpoint.test.ts`
- `tests/worktree-runner.test.ts`

v4.1 additionally made the test/launcher Python path portable across Windows and POSIX environments and separated runtime checkpoints from artifact-gated task evidence.
