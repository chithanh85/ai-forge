---
name: plan
description: Create structured plan with memory
---

# /plan — Implementation Planning + Memory

## Trigger

User types `/plan`

## Steps

### Phase 1: Context + Recall

1. Read `.planning/REQUIREMENTS.md`
2. Read `.planning/STATE.md`
3. **AUTO-RECALL past related work:**
   ```bash
   # MCP:
   mcp_second-brain_recall(query="{feature} planning implementation")
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py recall "{feature}"
   ```
4. Report: similar past implementations, lessons, effort estimates

### Phase 2: Plan Creation

1. Break feature into tasks (max 5-8 per plan)
2. Define dependencies between tasks
3. Estimate complexity (S/M/L/XL) — use past lessons for calibration
4. Define acceptance criteria per task
5. Define test requirements per task
6. Create `docs/plans/{feature-slug}.md`

### Phase 3: Update Tracking

1. Update `.planning/ROADMAP.md`
2. Update `.planning/MILESTONES.md`
3. Update `.planning/STATE.md`
4. **AUTO-REMEMBER the plan scope:**
   ```bash
   # MCP:
   mcp_second-brain_remember(
     topic="Plan created: {feature name}",
     detail="Tasks: {count}. Estimate: {total}. Key risks: {risks}.",
     tags=["plan", "{feature}"]
   )
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py remember \
     "Plan: {feature}" "Tasks: {count}. Estimate: {total}." \
     --tags plan feature --type decision
   ```

### Phase 4: Next Steps

- `/design` → Design database & architecture
- `/code` → Start implementing
