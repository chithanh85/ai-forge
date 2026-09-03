# Historical Decision — Clawpatch Integration

**Date:** 2026-05-24
**Type:** historical architecture decision
**Tags:** #clawpatch #code-review #awf-template

> Archive record. Clawpatch is an optional integration in AWF v4.1; it is not part of core correctness.

## Decision at the time

The template added a local proactive-review workflow around Clawpatch and kept its runtime state under `.clawpatch/`.

## Durable principle

Proactive external review can be useful before commit, but findings and generated patches remain untrusted until reviewed and verified against the repository.

## v4.1 interpretation

- Clawpatch is optional and may be unavailable.
- `.clawpatch/` runtime state is ignored by Git.
- Clawpatch does not replace tests, artifact gates, diff review or approval controls.
- AWF does not require a specific provider/model for independent review.

See `docs/INTEGRATIONS.md` and `docs/wiki/conventions/code-review.md` for current guidance.
