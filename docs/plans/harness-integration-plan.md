# Plan: Session Checkpointing + Git Worktree Runner Integration

**Status**: Draft
**Created**: 2026-05-28
**Run ID**: `20260528-harness-integration-plan`
**Estimated**: M (4-6h)
**Owner**: Codex Agent + AWF orchestrator

## Requirement Analysis

Yeu cau: tich hop hai primitive cua agent harness vao `awf-enterprise-template`:

1. **Session Checkpointing**: luu trang thai session cua agent bang file JSON `checkpoint.json` de co the resume, handoff, audit, va biet agent dang o buoc nao.
2. **Git Worktree Runner**: chay agent trong git worktree co lap de moi agent co working tree rieng, tranh ghi de thay doi cua user hoac cua agent khac.

Quyet dinh kien truc: tich hop thanh primitive nhe cua AWF, khong import nguyen bo harness ben ngoai. AWF da co artifact gate, Second Brain, GitNexus, split plan hydration, va orchestrator; phan con thieu la runtime state va isolated execution.

## Current Baseline

| Area               | Existing state                                                                 | Gap                                                                                 |
| ------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Session state      | `.agent/scripts/session_manager.py` chi luu `.planning/session.json` snapshot. | Chua co checkpoint theo run/agent, status, command history, worktree, artifacts.    |
| Artifact gate      | `.agent/artifacts/<run-id>/` co 5 JSON bat buoc va `checklist.py` validate.    | Checkpoint runtime chua lien ket voi artifact run.                                  |
| Orchestration      | `.agent/agents/orchestrator.md` va `parallel-agents` co scope/ownership rules. | Chua co buoc tao worktree/checkpoint truoc khi spawn write-agent.                   |
| Worktree isolation | `.tmp/` da duoc gitignore.                                                     | Chua co script tao, chay command, ghi checkpoint, status, cleanup worktree an toan. |
| Tests              | Vitest dang test Python CLI/scripts qua temp repo.                             | Can them regression tests cho checkpoint schema va git worktree runner.             |

## Contract

### Expected Output

- Extend `.agent/scripts/session_manager.py` thanh checkpoint manager co CLI va API nho, van giu tuong thich `save|restore`.
- Add `.agent/scripts/worktree_runner.py` de tao/chay/status/cleanup isolated worktree.
- Add tests:
  - `tests/session-checkpoint.test.ts`
  - `tests/worktree-runner.test.ts`
- Update workflow/rules docs de orchestrator biet khi nao tao checkpoint/worktree:
  - `.agent/agents/orchestrator.md`
  - `.agent/skills/parallel-agents/SKILL.md`
  - `.agent/workflows/code.md`
  - `.agent/workflows/debug.md`
  - `.agent/artifacts/README.md`
- Update `.gitignore` de runtime checkpoints khong bi commit: `.agent/checkpoints/`.

### Acceptance Criteria

- Given `/code` or orchestrator spawns a write-agent, when worktree mode is enabled, then the agent command runs with `cwd` inside `.tmp/worktrees/<run-id>/`.
- Given a checkpointed run starts, when `checkpoint init` completes, then `.agent/checkpoints/<run-id>/checkpoint.json` exists and validates against `awf.session-checkpoint.v1`.
- Given an agent command exits non-zero, when the runner finishes, then `checkpoint.json.state.status` is `failed`, command exit code is recorded, and worktree is not auto-removed.
- Given an agent command exits zero with `--cleanup on-success`, when runner finishes, then checkpoint status is `completed` and the worktree is removed through `git worktree remove`.
- Given the base repo has unrelated user changes, when runner is invoked without `--allow-dirty`, then it blocks before creating a worktree and records a blocked checkpoint.
- Given a dirty worktree contains expected agent edits, when `status` is requested, then the runner reports changed files without touching canonical root files.
- Given no GitNexus symbol is edited by this primitive itself, then risk gate records `docs/scripts_low_risk`; before future function edits, GitNexus impact is required per repo rule.

### Scope Boundary

In scope:

- Python stdlib-only scripts under `.agent/scripts/`.
- Vitest regression tests under `tests/`.
- Workflow/rule documentation updates under `.agent/`.
- Runtime checkpoint path `.agent/checkpoints/<run-id>/checkpoint.json`.
- Worktree path `.tmp/worktrees/<run-id>/`.

Out of scope:

- Docker sandboxing.
- Ticket/lease orchestration over GitHub Issues or Linear.
- Auto-merge from worktree to canonical branch.
- Running external agent CLIs in tests.
- Storing credentials, prompts with credentials, cookies, or environment dumps in checkpoints.

### Non-Negotiable Constraints

- TDD first: write failing tests before changing `session_manager.py` or adding `worktree_runner.py`.
- No new runtime dependency; use Python stdlib and existing git CLI.
- Never run destructive git commands in canonical root.
- Worktree cleanup must use `git worktree remove`, not recursive delete.
- Runner must refuse paths outside the repo-owned `.tmp/worktrees/` root.
- Checkpoint writes must be atomic: write temp JSON, then replace `checkpoint.json`.
- Checkpoints are local runtime state and must stay untracked.
- Do not capture raw environment variables; only record allowlisted AWF variables.

### Touchpoints

- `.agent/scripts/session_manager.py`: checkpoint data model and CLI.
- `.agent/scripts/worktree_runner.py`: new runner CLI.
- `.agent/agents/orchestrator.md`: create checkpoint/worktree before spawning write-agent.
- `.agent/skills/parallel-agents/SKILL.md`: one worktree per write-agent; no shared write scope.
- `.agent/workflows/code.md`: run implementation through worktree runner when task has isolated write ownership.
- `.agent/workflows/debug.md`: debugger stays serial, but may use a worktree for risky fixes after diagnosis.
- `.agent/artifacts/README.md`: explain relation between artifacts and runtime checkpoint.
- `.gitignore`: ignore `.agent/checkpoints/`.
- Tests in `tests/` mirror existing artifact-gate style.

## Data Structures

### Checkpoint File

Canonical path:

```text
.agent/checkpoints/<run-id>/checkpoint.json
```

Schema id: `awf.session-checkpoint.v1`

Example:

```json
{
  "schema": "awf.session-checkpoint.v1",
  "version": 1,
  "run_id": "20260528-harness-demo",
  "checkpoint_id": "20260528-harness-demo:codex-worker",
  "task": {
    "title": "Implement harness primitives",
    "request": "Integrate Session Checkpointing and Git Worktree Runner",
    "plan_slug": "harness-integration",
    "active_phase": "phase-01-checkpoint.md"
  },
  "agent": {
    "id": "codex-worker",
    "role": "worker",
    "parent_run_id": "20260528-harness-demo"
  },
  "repo": {
    "root": "D:/Project/awf-enterprise-template",
    "base_ref": "HEAD",
    "base_sha": "<git sha>",
    "dirty_policy": "block"
  },
  "worktree": {
    "enabled": true,
    "path": "D:/Project/awf-enterprise-template/.tmp/worktrees/20260528-harness-demo",
    "branch": "awf/20260528-harness-demo",
    "created": true,
    "cleanup": "on-success"
  },
  "artifacts": {
    "run_id": "20260528-harness-demo",
    "dir": ".agent/artifacts/20260528-harness-demo",
    "required": [
      "context-snippets.json",
      "risk-gate.json",
      "verification.json",
      "review-decision.json",
      "adversarial-validation.json"
    ]
  },
  "state": {
    "status": "running",
    "current_step": "green implementation",
    "summary": "Unit tests are red; implementing minimum code."
  },
  "todo": [
    {
      "id": "T1",
      "title": "Add checkpoint init/update CLI",
      "status": "in_progress",
      "owner": "codex-worker"
    }
  ],
  "events": [
    {
      "ts": "2026-05-28T12:00:00+07:00",
      "type": "created",
      "message": "Checkpoint initialized",
      "data": {}
    }
  ],
  "commands": [
    {
      "ts": "2026-05-28T12:01:00+07:00",
      "cmd": ["pnpm", "test"],
      "cwd": ".tmp/worktrees/20260528-harness-demo",
      "status": "fail",
      "exit_code": 1,
      "duration_ms": 2240,
      "summary": "session checkpoint tests failed before implementation"
    }
  ],
  "files": {
    "allowed": [
      ".agent/scripts/session_manager.py",
      "tests/session-checkpoint.test.ts"
    ],
    "forbidden": ["credentials/**", ".env", ".env.*"],
    "touched": []
  },
  "verification": {
    "last_result": "unknown",
    "commands": []
  },
  "timestamps": {
    "created_at": "2026-05-28T12:00:00+07:00",
    "updated_at": "2026-05-28T12:01:00+07:00"
  }
}
```

Allowed statuses:

- `initialized`
- `running`
- `blocked`
- `failed`
- `completed`
- `abandoned`

Allowed todo statuses:

- `pending`
- `in_progress`
- `done`
- `blocked`

Allowed command statuses:

- `pass`
- `fail`
- `skipped`

### Runner Config

`worktree_runner.py` builds this internal config from CLI args:

```python
@dataclass
class RunnerConfig:
    run_id: str
    task: str
    agent_id: str
    agent_role: str
    base_ref: str
    branch: str | None
    worktree_root: Path
    checkpoint_file: Path | None
    artifact_run_id: str | None
    cleanup: Literal["never", "on-success"]
    allow_dirty: bool
    timeout_sec: int | None
    command: list[str]
```

`CommandResult`:

```python
@dataclass
class CommandResult:
    cmd: list[str]
    cwd: str
    exit_code: int
    duration_ms: int
    stdout_tail: str
    stderr_tail: str
```

`WorktreeInfo`:

```python
@dataclass
class WorktreeInfo:
    path: Path
    branch: str
    base_ref: str
    base_sha: str
```

## Functions To Implement

### `.agent/scripts/session_manager.py`

Keep existing `save_session()` and `restore_session()` as compatibility wrappers. Add these pure helpers first, then CLI commands.

| Function                                                                                                                    | Params                                                                                                                                           | Returns        | Behavior                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------ |
| `now_iso()`                                                                                                                 | none                                                                                                                                             | `str`          | Timezone-aware ISO timestamp.                                                              |
| `checkpoint_dir(project_root: Path, run_id: str) -> Path`                                                                   | `project_root`, `run_id`                                                                                                                         | `Path`         | Returns `.agent/checkpoints/<run-id>` after validating run id is path-safe.                |
| `default_checkpoint_file(project_root: Path, run_id: str) -> Path`                                                          | `project_root`, `run_id`                                                                                                                         | `Path`         | Returns `.agent/checkpoints/<run-id>/checkpoint.json`.                                     |
| `validate_run_id(run_id: str) -> str`                                                                                       | `run_id`                                                                                                                                         | `str`          | Allows only `[A-Za-z0-9._-]`; rejects path traversal and empty values.                     |
| `build_checkpoint(...) -> dict`                                                                                             | `run_id`, `task`, `agent_id`, `agent_role`, `project_root`, optional `plan_slug`, `active_phase`, `worktree`, `artifact_run_id`, `allowed_files` | `dict`         | Builds schema-valid initial checkpoint with `state.status = "initialized"`.                |
| `validate_checkpoint(data: dict) -> list[str]`                                                                              | checkpoint dict                                                                                                                                  | list of errors | Checks schema, required fields, status enums, command shape, and no forbidden env capture. |
| `load_checkpoint(path: Path) -> dict`                                                                                       | checkpoint path                                                                                                                                  | `dict`         | Reads JSON object; raises `CheckpointError` on missing/invalid data.                       |
| `write_checkpoint_atomic(path: Path, data: dict) -> None`                                                                   | checkpoint path, data                                                                                                                            | none           | Creates parent dirs, writes `checkpoint.tmp`, replaces `checkpoint.json`.                  |
| `update_checkpoint(path: Path, patch: dict) -> dict`                                                                        | checkpoint path, shallow patch                                                                                                                   | `dict`         | Loads, merges allowed top-level fields, updates `timestamps.updated_at`, writes.           |
| `append_event(path: Path, event_type: str, message: str, data: Optional[dict] = None) -> dict`                              | checkpoint path, type, message, optional data                                                                                                    | `dict`         | Appends event and writes.                                                                  |
| `record_command(path: Path, cmd: list[str], cwd: str, status: str, exit_code: int, duration_ms: int, summary: str) -> dict` | checkpoint path and command details                                                                                                              | `dict`         | Appends command, updates verification last result if relevant.                             |
| `mark_status(path: Path, status: str, summary: Optional[str] = None, current_step: Optional[str] = None) -> dict`           | checkpoint path, status, optional summary/current step                                                                                           | `dict`         | Updates `state`.                                                                           |
| `render_summary(data: dict) -> str`                                                                                         | checkpoint dict                                                                                                                                  | `str`          | Human-readable summary for `show` and handoff.                                             |

CLI:

```bash
python .agent/scripts/session_manager.py checkpoint init \
  --run-id 20260528-demo \
  --task "Implement checkpoint manager" \
  --agent-id codex-worker \
  --agent-role worker \
  --plan-slug harness-integration

python .agent/scripts/session_manager.py checkpoint event \
  --file .agent/checkpoints/20260528-demo/checkpoint.json \
  --type scout \
  --message "Read current session_manager baseline"

python .agent/scripts/session_manager.py checkpoint command \
  --file .agent/checkpoints/20260528-demo/checkpoint.json \
  --cmd-json "[\"pnpm\",\"test\"]" \
  --status fail \
  --exit-code 1 \
  --duration-ms 2240 \
  --summary "checkpoint tests failed before implementation"

python .agent/scripts/session_manager.py checkpoint status \
  --file .agent/checkpoints/20260528-demo/checkpoint.json \
  --status completed \
  --summary "All verification passed"

python .agent/scripts/session_manager.py checkpoint show \
  --file .agent/checkpoints/20260528-demo/checkpoint.json
```

### `.agent/scripts/worktree_runner.py`

New stdlib-only script.

| Function                                                                                                                   | Params                                  | Returns              | Behavior                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `resolve_repo_root(start: Path) -> Path`                                                                                   | any path                                | `Path`               | Uses `git rev-parse --show-toplevel`.                                                    |
| `validate_worktree_root(repo_root: Path, worktree_root: Path) -> Path`                                                     | repo root, requested root               | `Path`               | Requires path under `<repo>/.tmp/worktrees`.                                             |
| `slugify_run_id(raw: str) -> str`                                                                                          | raw run id                              | `str`                | Converts invalid chars to `-`, rejects empty/path traversal.                             |
| `run_git(repo_root: Path, args: list[str], check: bool = True) -> subprocess.CompletedProcess[str]`                        | repo root, git args, check flag         | completed process    | Runs git without shell.                                                                  |
| `git_status_porcelain(path: Path) -> list[str]`                                                                            | repo/worktree path                      | status lines         | Reads `git status --porcelain`.                                                          |
| `ensure_base_allowed(repo_root: Path, allow_dirty: bool) -> None`                                                          | repo root, dirty policy                 | none                 | Blocks dirty canonical root unless `allow_dirty` is true.                                |
| `create_worktree(repo_root: Path, run_id: str, base_ref: str, worktree_root: Path, branch: Optional[str]) -> WorktreeInfo` | repo root, ids, base, path root, branch | `WorktreeInfo`       | Runs `git worktree add -b <branch> <path> <base_ref>`; refuses existing path by default. |
| `build_runner_env(repo_root: Path, info: WorktreeInfo, checkpoint_file: Path, artifact_run_id: str) -> dict[str, str]`     | paths and ids                           | env map              | Adds `AWF_RUN_ID`, `AWF_CHECKPOINT_FILE`, `AWF_ARTIFACT_RUN_ID`, `AWF_WORKTREE_PATH`.    |
| `run_agent_command(command: list[str], cwd: Path, env: dict[str, str], timeout_sec: Optional[int]) -> CommandResult`       | command, cwd, env, timeout              | `CommandResult`      | Runs command without shell; records duration and output tails only.                      |
| `collect_diff_summary(worktree_path: Path) -> dict`                                                                        | worktree path                           | changed file summary | Uses `git status --porcelain` and `git diff --stat`.                                     |
| `remove_worktree(repo_root: Path, worktree_path: Path, force: bool = False) -> None`                                       | repo root, path, force                  | none                 | Runs `git worktree remove`; never recursive deletes directly.                            |
| `run_in_worktree(config: RunnerConfig) -> int`                                                                             | parsed config                           | process exit code    | Full lifecycle: validate, checkpoint init, create worktree, run command, update status.  |

CLI:

```bash
python .agent/scripts/worktree_runner.py run \
  --run-id 20260528-demo \
  --task "Implement checkpoint manager" \
  --agent-id codex-worker \
  --agent-role worker \
  --base-ref HEAD \
  --cleanup on-success \
  -- python -c "from pathlib import Path; Path('runner-proof.txt').write_text('ok')"

python .agent/scripts/worktree_runner.py status --run-id 20260528-demo

python .agent/scripts/worktree_runner.py cleanup --run-id 20260528-demo --force
```

Default paths:

- Worktree: `.tmp/worktrees/<run-id>`
- Branch: `awf/<run-id>`
- Checkpoint: `.agent/checkpoints/<run-id>/checkpoint.json`
- Artifact run: same as `run_id` unless `--artifact-run-id` is passed.

## Workflow Integration

### Orchestrator

Add a "Harness Runtime Gate" before spawning write-agents:

1. Determine if the task writes files.
2. Assign `run_id` and file ownership.
3. Create checkpoint with allowed/forbidden files.
4. For each independent write-agent, run through `worktree_runner.py run`.
5. Read each checkpoint before synthesis.
6. Parent merges only after tests pass and file ownership has no conflicts.

Read-only scout/review agents do not need worktrees, but should still write events into the parent checkpoint when useful.

### `/code`

Add worktree mode after plan/risk gate and before TDD:

```text
Contract + risk gate pass
  -> create checkpoint
  -> create isolated worktree
  -> run implementation agent command in worktree
  -> run tests in worktree
  -> parent reviews diff
  -> merge/apply only after approval
```

### `/debug`

Debugger remains serial. Worktree runner is used only after Scout & Diagnose:

```text
Scout + Diagnose
  -> risk gate allow
  -> create worktree for risky fix
  -> write regression test and fix in worktree
  -> parent reviews diff before applying
```

## Implementation Tasks

### Task 1: Checkpoint Tests First

- **Files**: `tests/session-checkpoint.test.ts`
- **Goal**: Lock JSON schema and CLI behavior.
- **Tests**:
  - Given `checkpoint init`, when required args are supplied, then `checkpoint.json` is created with schema `awf.session-checkpoint.v1`.
  - Given invalid run id `../bad`, when init runs, then command exits non-zero and no file is created outside `.agent/checkpoints`.
  - Given `checkpoint event`, when event is appended, then `events.length` increments and `timestamps.updated_at` changes.
  - Given `checkpoint command` with `status fail`, when recorded, then command exit code and summary are persisted.
  - Given invalid command status, when recorded, then validation fails.
  - Given `checkpoint show`, when checkpoint exists, then output includes run id, state status, current step, and last command.

### Task 2: Implement Checkpoint Manager

- **Files**: `.agent/scripts/session_manager.py`
- **Goal**: Add checkpoint API and CLI while preserving current `save|restore`.
- **Acceptance**:
  - All Task 1 tests pass.
  - Existing `python .agent/scripts/session_manager.py save` still writes `.planning/session.json`.
  - Existing `restore` output still works if `.planning/session.json` exists.

### Task 3: Worktree Runner Tests First

- **Files**: `tests/worktree-runner.test.ts`
- **Goal**: Prove runner lifecycle in temp git repo without external agent CLIs.
- **Tests**:
  - Given a clean temp git repo, when `run` executes a harmless Python command, then command cwd is inside `.tmp/worktrees/<run-id>`.
  - Given command creates `runner-proof.txt`, when run completes, then file exists only in the worktree branch, not canonical root.
  - Given `--cleanup on-success`, when command exits zero, then `git worktree list` no longer includes the worktree path.
  - Given command exits `7`, when runner completes, then process exits `7`, checkpoint status is `failed`, and worktree remains.
  - Given canonical root is dirty and `--allow-dirty` is absent, when runner starts, then it blocks and records `state.status = "blocked"`.
  - Given `--allow-dirty`, when root is dirty, then runner proceeds and records `repo.dirty_policy = "allow"`.
  - Given `status --run-id`, when worktree has changes, then output includes changed file paths.
  - Given a worktree root outside `.tmp/worktrees`, when run starts, then it fails before any git worktree command.

### Task 4: Implement Worktree Runner

- **Files**: `.agent/scripts/worktree_runner.py`
- **Goal**: Create isolated worktree lifecycle with checkpoint integration.
- **Acceptance**:
  - All Task 3 tests pass.
  - Script uses `subprocess.run([...], shell=False)`.
  - Cleanup uses `git worktree remove`.
  - No command records full environment values.

### Task 5: Wire Workflows And Orchestrator

- **Files**:
  - `.agent/agents/orchestrator.md`
  - `.agent/skills/parallel-agents/SKILL.md`
  - `.agent/workflows/code.md`
  - `.agent/workflows/debug.md`
  - `.agent/artifacts/README.md`
  - `.gitignore`
- **Goal**: Make the primitives discoverable and mandatory for write-agent isolation where appropriate.
- **Acceptance**:
  - Orchestrator prompt template includes `run_id`, checkpoint path, worktree path, allowed files, and cleanup policy.
  - `parallel-agents` states each write-agent gets a distinct worktree.
  - `/code` requires checkpoint before implementation execution.
  - `/debug` only creates fix worktree after diagnosis/risk gate.
  - `.gitignore` includes `.agent/checkpoints/`.

### Task 6: End-To-End Verification

- **Commands**:
  - `pnpm test -- tests/session-checkpoint.test.ts`
  - `pnpm test -- tests/worktree-runner.test.ts`
  - `pnpm test`
  - `pnpm lint:check`
  - `pnpm typecheck`
  - `python .agent/scripts/wiki_lint.py --strict`
  - `AWF_ARTIFACT_RUN_ID=<run-id> python .agent/scripts/checklist.py .`
- **Acceptance**:
  - All commands pass.
  - Checkpoint test fixtures do not leave temp worktrees behind.
  - Artifact gate validates the implementation run.

## Risk Register

| Risk                                          | Impact | Mitigation                                                                 |
| --------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| Runner deletes wrong directory                | High   | Only use `git worktree remove`; validate path under `.tmp/worktrees`.      |
| Checkpoint captures sensitive data            | High   | Store allowlisted AWF vars only; no full env; artifact scanner remains.    |
| Dirty canonical root blocks legitimate work   | Medium | Default block; explicit `--allow-dirty` records policy in checkpoint.      |
| Worktree branch collisions                    | Medium | Use sanitized `awf/<run-id>` and fail if branch/path exists unless forced. |
| Tests depend on global git identity           | Medium | Temp tests configure local `user.email` and `user.name`.                   |
| Windows path handling                         | Medium | Use `Path.resolve`, no shell string parsing, Vitest temp dirs on Windows.  |
| Overlap with artifact gate creates busywork   | Low    | Runtime checkpoint is separate; artifacts remain completion evidence.      |
| Orchestrator overuses worktrees for read-only | Low    | Only write-agents require worktrees; read-only agents can share root.      |

## Rollback Plan

1. Remove workflow references to `worktree_runner.py`.
2. Keep `session_manager.py save|restore` compatibility path intact.
3. Remove `.agent/scripts/worktree_runner.py` if lifecycle tests reveal unsafe behavior.
4. Leave `.agent/checkpoints/` ignored so any runtime files remain local.

## Done When

- Checkpoint manager and worktree runner tests are written before code and pass.
- `checkpoint.json` is created/updated atomically for each write-agent run.
- Agent commands execute inside `.tmp/worktrees/<run-id>/`.
- Failed commands leave resumable checkpoint and preserve the worktree for inspection.
- Workflows document exactly when checkpoint/worktree mode is required.
- Full AWF checklist passes for the implementation run.
