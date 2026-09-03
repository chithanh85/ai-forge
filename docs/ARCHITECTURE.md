# AWF v4.1 Architecture

## Goal

AWF provides a repository-level contract for disciplined AI-assisted development without coupling that contract to one package manager, model provider, or coding client.

## Source-of-truth hierarchy

For AWF-managed behavior, use this order:

1. Project-local user instructions that explicitly override AWF.
2. `.awf/policy/core.md` for client-neutral operating policy.
3. `.awf/manifest.json` for project identity, logical commands, client and integration state.
4. Client adapters (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`) for native entrypoints.
5. Workflow/skill documents under `.agent/` for task-specific behavior.
6. Historical docs only as background evidence.

Repository evidence outranks chat assumptions and template-author machine state.

## Core and adapters

```text
                    .awf/policy/core.md
                            |
                    .awf/manifest.json
                            |
                    scripts/awf/sync.mjs
                            |
             +--------------+--------------+
             |              |              |
          AGENTS.md       GEMINI.md      CLAUDE.md
             |              |              |
             +--------- active client -----+
                            |
                    project filesystem
```

Adapters deliberately contain little policy. AWF owns only the text between:

```text
<!-- awf:managed:start -->
...
<!-- awf:managed:end -->
```

Content outside that region belongs to the project/user and must survive sync.

## Manifest

`.awf/manifest.json` schema v1 contains project identity, detected package manager, logical commands, client states and optional integration states. It is project-local configuration, not a global user profile.

## Toolchain detection

`init.mjs` detects the target repository in this order:

1. `pnpm-lock.yaml`
2. `yarn.lock`
3. `bun.lock` / `bun.lockb`
4. `package-lock.json`
5. `packageManager` in `package.json`
6. npm fallback

The detected manager is compiled into logical commands. Shared workflows should call logical commands rather than hard-coding package-manager syntax.

## Initialization lifecycle

```text
project name
  -> sanitize identity
  -> detect toolchain
  -> hydrate template-owned identity placeholders
  -> reset template session state
  -> write manifest
  -> sync client adapters
```

`init` does not select a model, bypass client safety, deploy services, or install every optional integration. Platform launchers add environment-file copying, integration flags, dependency installation, bootstrap verification, and optional Git initialization.

## Runtime state boundaries

- `.planning/STATE.md` describes current project/session state.
- `.agent/artifacts/<run-id>/` stores current task evidence.
- `.agent/checkpoints/` stores ignored runtime checkpoint state.
- `.tmp/` stores ignored temporary work and worktrees.
- dated lessons and completed plans in `docs/` are historical evidence.

A new project must not inherit template-maintainer task evidence as if it were its own.

## Verification model

Bootstrap/core verification:

```bash
python .agent/scripts/checklist.py . --core
```

Normal project/task verification:

```bash
python .agent/scripts/checklist.py .
```

The normal path validates context, risk, verification, review and adversarial-validation artifacts.

## Worktree isolation

`.agent/scripts/worktree_runner.py` can run write work under `.tmp/worktrees/<run-id>/`. Unsafe roots are rejected and canonical-root dirtiness normally blocks execution unless explicitly allowed.

Worktree isolation is useful for concurrent or high-risk writes, but is not required for every tiny task.

## Model and agent routing boundary

AWF may define semantic roles such as planner, implementer and independent reviewer. The active client/router/user maps those roles to concrete models. Shared AWF policy should not hard-code vendor model names.

## Optional integration boundary

Integrations are capabilities, not prerequisites:

```text
detect -> explicitly enable -> configure -> verify -> use -> degrade gracefully
```

AWF should not execute an unpinned remote installer merely because an integration is mentioned in a workflow.

## Known v4.1 boundaries

- AWF is repo-local; a packaged global CLI/update channel is future distribution work.
- The source repository has a placeholder application build command; Doctor reports it as not configured.
- Some optional capabilities still require project-specific/manual setup.
- Existing-repository adoption requires reviewing the generated diff; v4.1 does not promise zero-conflict merging into arbitrary conventions.
