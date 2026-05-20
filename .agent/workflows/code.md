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
2. Read relevant plan from `docs/plans/`
3. Load skills: `clean-code`, `testing-patterns`, `database-design`
4. **AUTO-RECALL:**
   ```bash
   # MCP available:
   mcp_second-brain_recall(query="{feature name} patterns lessons")
   # Local fallback:
   python .agent/skills/auto-memory/scripts/local_brain.py recall "{feature name}"
   ```
5. Report recalled context to user (if any relevant lessons found)

### Phase 2: TDD Cycle (Red-Green-Refactor)

1. **RED**: Write failing test first (unit test for the feature)
2. **GREEN**: Write minimum code to make test pass
3. **REFACTOR**: Clean up code while keeping tests green

### Phase 3: Self-Healing Loop

```
Code written → Run tests
  ├── PASS → Continue to next task
  └── FAIL → Auto-fix attempt (max 3 retries)
       ├── Fix successful → remember("Auto-fix: {what was wrong}")
       └── 3 failures → Escalate to human + remember("Escalated: {reason}")
```

### Phase 4: Post-Implementation

1. Run `pnpm lint`
2. Run `pnpm test`
3. Update `.planning/STATE.md`
4. **AUTO-REMEMBER:**
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
5. Commit with conventional commit message

### Phase 5: Next Steps

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
