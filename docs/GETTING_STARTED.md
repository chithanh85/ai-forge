# Getting Started with AWF v4.1

## Prerequisites

Install Node.js 18+, Python 3.10+, Git, and the package manager used by your target repository.

Windows setup accepts either `python.exe` or the standard `py -3` launcher. Bash setup detects `python3` first, then `python`.

## Start from the template

### Windows

```powershell
git clone https://github.com/chithanh85/ai-forge.git my-project
cd my-project
.\setup-enterprise.ps1 -ProjectName my-project
```

Useful flags:

```text
-SkipGit
-SkipDeps
-EnableBrain
-EnableGitNexus
-EnableCodebaseMemory
-NonInteractive
```

### Linux / macOS / WSL

```bash
git clone https://github.com/chithanh85/ai-forge.git my-project
cd my-project
bash ./setup-enterprise.sh --project-name my-project
```

Useful flags:

```text
--skip-git
--skip-deps
--enable-brain
--enable-gitnexus
--enable-codebase-memory
--non-interactive
```

Both launchers change directory to the directory that contains the launcher before modifying project files. Calling setup through an absolute path from another working directory must not mutate the caller's repository.

## What setup does

In order, setup:

1. validates Node and Python availability;
2. runs the AWF native initializer;
3. creates local environment/credential files only when an example exists and the destination does not;
4. records optional integration state and performs pinned GitNexus setup only when requested;
5. installs dependencies unless skipped;
6. runs core verification;
7. initializes Git only when requested and when `.git` does not already exist.

Non-interactive setup does not silently enable optional integrations.

## Repo-local init without the platform launcher

For a repository that already contains the AWF files:

```bash
node scripts/awf/init.mjs --project-name my-project --root .
node scripts/awf/doctor.mjs --root .
```

Use this path when you want AWF hydration but do not want the launcher to copy env examples, install dependencies, or initialize Git.

If you overlay AWF into an existing repository, inspect the resulting diff before committing. `init` intentionally rewrites AWF-owned state such as `.planning/STATE.md` and managed adapter regions.

## Complete project identity

After bootstrap, edit `.planning/PROJECT.md` with the project description, stack, and ownership details that matter to the project. Do not put secrets in planning docs.

## Inspect the manifest

Confirm `.awf/manifest.json` has the correct project name, package manager, logical commands, and integration booleans.

If the repository changes package manager later, rerun init deliberately and review the diff.

## Run Doctor

```bash
node scripts/awf/doctor.mjs --root .
```

Doctor checks manifest health, package-manager drift, managed adapters, unsafe shared bypass flags, concrete model pins in managed configuration, MCP runtime pinning, and whether build is real or a placeholder.

A template with no application build is expected to show a build warning.

## Verify core health

In the source repository:

```bash
npm run lint
npm run typecheck
npm test
npm run wiki:lint
npm audit --audit-level=high
```

Bootstrap/core verification is:

```bash
python .agent/scripts/checklist.py . --core
```

Do not use `--core` to bypass project-task artifact requirements after implementation work has started.

## Begin project work

For a substantive request:

1. read `.planning/STATE.md` and `.planning/PROJECT.md`;
2. read `docs/wiki-index.md` and relevant current docs;
3. classify the request with `docs/FEATURE_INTAKE.md`;
4. use the workflow appropriate to the risk lane;
5. create task artifacts when required;
6. verify before completion.

## Troubleshooting

### Wrong package manager

Check which lockfile exists. AWF gives lockfiles precedence. Remove stale lockfiles only if they genuinely do not belong to the project, then rerun init.

### Adapter drift

```bash
node scripts/awf/sync.mjs --root .
```

Custom text outside AWF managed markers should remain intact.

### `BUILD: NOT_CONFIGURED`

That is not an AWF failure. Configure a real target-project build and update the manifest command if needed.

### Optional integration unavailable

Leave it disabled and continue with native repository/client tools. Optional integrations must not block core work.

### Setup changed the wrong directory

v4.1 launchers are regression-tested to anchor to their own script directory. Treat a recurrence as a bootstrap bug; do not accept mutations in the caller repository as normal behavior.
