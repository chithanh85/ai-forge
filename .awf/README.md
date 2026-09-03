# `.awf/` — Canonical AWF Configuration

This directory contains the project-local AWF contract introduced in v4.1.

## Files

- `manifest.json` — project identity, detected toolchain commands, client states, and optional integration states.
- `policy/core.md` — canonical client-neutral operating policy.

## Ownership

`.awf/policy/core.md` is framework policy. Client adapters reference it rather than copying the full policy.

`.awf/manifest.json` is generated/updated by the repo-local AWF engine. Review changes like any other configuration change.

## Related commands

```bash
node scripts/awf/init.mjs --project-name <name> --root .
node scripts/awf/sync.mjs --root .
node scripts/awf/doctor.mjs --root .
node scripts/awf/configure.mjs --root . --integration <name>=true
node scripts/awf/exec.mjs test --root .
```

## Boundaries

- AWF core defines capabilities and workflow contracts, not concrete vendor models.
- Adapters preserve user-authored content outside AWF managed regions.
- Optional integrations must degrade gracefully.
- Runtime task evidence belongs under `.agent/artifacts/`, not `.awf/`.
- Secrets do not belong in this directory.
