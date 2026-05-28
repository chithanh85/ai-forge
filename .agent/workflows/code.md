---
name: code
description: Implementation with Self-Healing Loop + Auto Memory
---

# /code — Implementation (TDD + Self-Healing + Memory)

## Trigger

User types `/code`

## Steps

### Phase 1: Preflight + Recall

1. Read `.planning/STATE.md`
2. List split plans with `python .agent/scripts/plan_hydrate.py list`
3. Load only the active phase context with `python .agent/scripts/plan_hydrate.py context {feature-slug}`; do not read every plan file.
4. Read `.agent/rules/rationalization-prevention.md`
5. Load skills: `clean-code`, `testing-patterns`, `database-design`
6. **AUTO-RECALL:**
   ```bash
   # MCP available:
   mcp_second-brain_recall(query="{feature name} patterns lessons")
   # Local fallback:
   python .agent/skills/auto-memory/scripts/local_brain.py recall "{feature name}"
   ```
7. Report recalled context to user (if any relevant lessons found)

### Phase 2: Contract + Risk Gate

1. Validate that a relevant plan exists in `docs/plans/`.
2. If no plan exists, route to `/plan` first.
3. Confirm the split plan folder includes:
   - `index.md`
   - `phase-XX-*.md`
   - `current-phase.txt`
4. Confirm the active hydrated context includes:
   - Expected output
   - Acceptance Criteria
   - Scope boundary
   - Non-negotiable constraints
   - Touchpoints
5. Run the rationalization-prevention check before writing implementation code and record the result in `adversarial-validation.json`.
6. Validate `.agent/artifacts/<run-id>/risk-gate.json` and scored `review-decision.json` before editing.
7. `--fast` may validate a compact plan and compact risk gate, but it cannot skip planning, risk review, TDD, or artifact validation.
8. If the risk gate or any plan reviewer blocks the run, stop and ask for explicit approval.

### Phase 2.5: Checkpoint & Worktree Spawning

1. Initialize a checkpoint file:
   ```bash
   python .agent/scripts/session_manager.py checkpoint init --run-id {run-id} --task {task-title} --agent-id {agent-id} --agent-role worker --plan-slug {plan-slug}
   ```
2. For isolated file writing and testing, spawn execution inside a Git Worktree:
   ```bash
   python .agent/scripts/worktree_runner.py run --run-id {run-id} --task {task-title} --agent-id {agent-id} --agent-role worker --cleanup on-success -- <command-to-execute>
   ```
   _Note: In worktree mode, TDD cycle (Phase 3) and Self-Healing Loop (Phase 4) execute inside the isolated worktree directory._

### Phase 3: TDD Cycle (Red-Green-Refactor)

1. **RED**: Write failing test first (unit test for the feature)
2. **GREEN**: Write minimum code to make test pass
3. **REFACTOR**: Clean up code while keeping tests green

### Phase 4: Self-Healing Loop

```
Code written → Run tests
  ├── PASS → Continue to next task
  └── FAIL → Auto-fix attempt (max 3 retries)
       ├── Fix successful → remember("Auto-fix: {what was wrong}")
       └── 3 failures → Escalate to human + remember("Escalated: {reason}")
```

### Phase 5: Post-Implementation

1. Run `pnpm lint`
2. Run `pnpm test`
3. Write/update `.agent/artifacts/<run-id>/verification.json`
4. Write/update `.agent/artifacts/<run-id>/review-decision.json`
5. Write/update `.agent/artifacts/<run-id>/adversarial-validation.json`
6. Run `python .agent/scripts/checklist.py .`; artifact gate failures block completion.
7. Update `.planning/STATE.md`
8. **AUTO-REMEMBER:**
   ```bash
   # MCP available:
   mcp_second-brain_remember(
     topic="Implemented {feature name}",
     detail="{patterns used, gotchas encountered, integration notes}",
     tags=["{module}", "implementation"]
   )
   # Local fallback:
   python .agent/skills/auto-memory/scripts/local_brain.py remember \
     "Implemented {feature name}" \
     "{patterns used, gotchas encountered}" \
     --tags module implementation --type lesson
   ```
9. Commit with conventional commit message

### Phase 6: Next Steps

- `/test` → Run full test suite
- `/code` → Continue with next task
- `/deploy` → Deploy to staging/production

### 📡 Teleport Hook (Auto)

If `../teleport/` exists and user is AFK:

```bash
node ../teleport/scripts/send-telegram.mjs "<emoji> *<Agent> on {feature}:*
✅ Implementation complete
✅ Tests passing
⬜ Ready for review"
```

Then start reply listener per `@[skills/teleport-bridge]`.
