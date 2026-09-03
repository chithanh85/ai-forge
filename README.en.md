# AWF Enterprise Template v4.1

> 🇻🇳 [Đọc README tiếng Việt](README.md)

AWF is a **client-neutral AI development workflow template**. It gives a repository one canonical operating policy, project-local configuration, workflow contracts, verification gates, and thin adapters for AI coding clients such as Codex-, Gemini/Antigravity-, and Claude-compatible environments.

AWF is **not** a model router, a promise of unattended software delivery, or a replacement for the native safety model of the client you use.

## Why v4.1 exists

Earlier versions accumulated machine-specific assumptions: package-manager commands embedded in rules, provider/model names in workflows, client-specific syntax in shared policy, and template-maintainer runtime state copied into new projects.

v4.1 changes the distribution model:

```text
                         AWF CORE
                policy / contracts / state
                          |
                    .awf/manifest.json
                          |
                     init / sync
                          |
        ---------------------------------------
        |                  |                  |
     AGENTS.md          GEMINI.md          CLAUDE.md
   compatible clients   Gemini-family      Claude-family
        |                  |                  |
        ---------------- capabilities --------
                          |
                  project toolchain
               npm / pnpm / yarn / bun
```

The repository is organized around six principles:

1. **One canonical policy** — `.awf/policy/core.md` is client-neutral.
2. **Project-local configuration** — `.awf/manifest.json` records identity, logical commands, clients, and integration state.
3. **Native adapters, not duplicated policy** — `AGENTS.md`, `GEMINI.md`, and `CLAUDE.md` contain AWF-managed regions while preserving project-owned text outside them.
4. **Toolchain detection** — the target repository keeps its detected package manager instead of inheriting one from the template author.
5. **Provider neutrality** — AWF defines roles/capabilities; the active client/router/user chooses concrete models.
6. **Evidence before completion** — tests, artifacts, review decisions, and Git state are checked before a task is called done.

## Repository layout

```text
.awf/
  manifest.json             Canonical project-local AWF configuration
  policy/core.md            Canonical client-neutral operating policy
.agent/
  agents/                   Specialist role definitions
  workflows/                Workflow contracts (/plan, /code, /debug, ...)
  skills/                   Reusable domain skills
  schemas/artifacts/        Artifact schemas
  scripts/                  Checklist, session, worktree and wiki tooling
  artifacts/                Runtime evidence for the current project
.planning/                  Project identity and current project state
docs/                       Current docs plus historical records
scripts/awf/                Repo-local init/sync/doctor/config/exec engine
AGENTS.md                    AGENTS-compatible adapter
GEMINI.md                    Gemini/Antigravity adapter
CLAUDE.md                    Claude-compatible adapter
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for source-of-truth boundaries and lifecycle details.

## Quick start

v4.1 is a **repository-local framework**, not a globally published `awf` CLI.

Prerequisites: Node.js 18+, Python 3.10+, Git, and the package manager required by the target repository.

### Windows PowerShell

```powershell
git clone https://github.com/chithanh85/ai-forge.git my-project
cd my-project
.\setup-enterprise.ps1 -ProjectName my-project
```

### Linux / macOS / WSL

```bash
git clone https://github.com/chithanh85/ai-forge.git my-project
cd my-project
bash ./setup-enterprise.sh --project-name my-project
```

Both launchers anchor execution to their own project directory, hydrate AWF state, install dependencies unless skipped, run core verification, and initialize Git when requested.

For flags and an existing-repository adoption path, read [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md).

## What initialization changes

`node scripts/awf/init.mjs --project-name <name>` performs bounded project hydration:

- sanitizes and records project identity;
- detects `pnpm-lock.yaml`, `yarn.lock`, `bun.lock*`, or `package-lock.json`;
- writes logical install/test/lint/typecheck/build/format commands into `.awf/manifest.json`;
- resets template session state into a fresh project state;
- hydrates template-owned identity placeholders;
- synchronizes AWF-managed regions in the three client adapters;
- preserves content outside managed adapter regions.

Running init/sync repeatedly is designed to be idempotent for AWF-owned regions.

## Core commands

```bash
node scripts/awf/init.mjs --project-name my-project --root .
node scripts/awf/sync.mjs --root .
node scripts/awf/doctor.mjs --root .
node scripts/awf/configure.mjs --root . --integration gitnexus=true
node scripts/awf/exec.mjs test --root .
```

Agents should prefer logical commands stored in `.awf/manifest.json` instead of hard-coding `npm`, `pnpm`, `yarn`, or `bun`.

## Workflow model

AWF workflows are contracts, not guarantees that every client can execute every step in the same way.

```text
request
  -> intake + risk lane
  -> plan when required
  -> design when risk requires it
  -> implementation
  -> verification
  -> review / adversarial validation
  -> audit for high-risk/deploy work
```

Risk lanes are defined in [docs/FEATURE_INTAKE.md](docs/FEATURE_INTAKE.md):

- **Tiny** — bounded, low-blast-radius work; compact planning is acceptable.
- **Normal** — explicit plan and normal verification.
- **High-Risk** — plan + design + explicit risk approval + stronger verification/audit.

The active client may parallelize independent subtasks if it supports safe parallel agents. Sequential execution remains correct.

## Evidence and artifact gate

For non-trivial plan/code/debug runs, AWF expects `.agent/artifacts/<run-id>/` to contain:

```text
context-snippets.json
risk-gate.json
verification.json
review-decision.json
adversarial-validation.json
```

The normal checklist fails closed when required evidence is missing or blocking. Bootstrap uses explicit `--core` mode because a brand-new project has no task artifact yet.

```bash
python .agent/scripts/checklist.py . --core   # framework/bootstrap verification
python .agent/scripts/checklist.py .          # normal project/task verification
```

## Client adapters and model ownership

AWF does not choose a vendor model for you. Managed adapters tell clients to read the core policy, resolve project commands from the manifest, use optional capabilities only when available, and keep provider/model selection client- or user-owned.

Concrete model names, reasoning levels, account configuration, sandbox policy, and approval policy belong to the active client/router/user configuration.

## Optional integrations

Core must remain usable when optional integrations are absent.

| Integration     | v4.1 posture                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------- |
| GitNexus        | Pinned transport definition is included; setup/indexing is opt-in and capability use is optional. |
| Second Brain    | Optional remote memory; local auto-memory fallback may be used when present.                      |
| Codebase Memory | Capability can be recorded, but AWF will not execute an unpinned remote installer.                |
| Rune            | Separate opt-in setup utility pinned by version.                                                  |
| Open Design     | Optional external capability; no broken/unpinned npm installer is run by core.                    |
| Clawpatch       | Optional local review workflow/state; not required for AWF core.                                  |
| Teleport        | Optional reporting bridge; project-specific setup only.                                           |

See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for trust boundaries.

## Verification in this source repository

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run wiki:lint
npm audit --audit-level=high
node scripts/awf/doctor.mjs --root .
```

The current `build` script is deliberately a placeholder because this repository is a framework/template rather than an application. AWF Doctor reports that as **NOT_CONFIGURED/WARN**; a placeholder build is never evidence of a production build.

## Security defaults

- Shared workflows do not disable client sandbox/approval/trust protections.
- Real `.env` and credential files are ignored and must not be committed.
- Executable integration packages should be pinned.
- Non-interactive setup does not silently enable optional integrations.
- High-risk work follows the stronger review/approval path.
- External AI output is untrusted until verified against repository evidence.

Read [SECURITY.md](SECURITY.md) before exposing automation to production credentials or remote execution.

## Documentation

Start with [docs/README.md](docs/README.md):

- [Architecture](docs/ARCHITECTURE.md)
- [Getting started](docs/GETTING_STARTED.md)
- [Operations](docs/OPERATIONS.md)
- [Integrations](docs/INTEGRATIONS.md)
- [Feature intake](docs/FEATURE_INTAKE.md)
- [Test matrix](docs/TEST_MATRIX.md)
- [Knowledge index](docs/wiki-index.md)

`docs/plans/completed/` and dated wiki lessons are **historical evidence**, not the current AWF contract.

## What v4.1 intentionally does not claim

- It does not guarantee unattended end-to-end delivery.
- It does not guarantee multi-agent parallelism on clients that do not support it.
- It does not route or select models for the user.
- It does not turn optional MCPs into hard dependencies.
- It does not treat a placeholder build command as successful application build evidence.
- It does not make arbitrary existing-repository adoption conflict-free; review the resulting diff.

Those boundaries are deliberate: AWF should improve agent discipline without pretending to own capabilities that belong to the active client or target project.
