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

### Phase 2: Contract Gate (Required, Including `--fast`)

Before task breakdown, produce or validate the 5-part plan contract:

| Prerequisite               | Required Content                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------- |
| Expected output            | Concrete files, behavior, docs, or artifacts to produce.                              |
| Acceptance Criteria        | Given-When-Then bullets with measurable pass/fail outcomes.                           |
| Scope boundary             | Files/areas allowed and explicitly forbidden.                                         |
| Non-negotiable constraints | Security, TDD, style, migration, compatibility, and no-credential rules.              |
| Touchpoints                | Callers, dependents, routes, scripts, docs, external services, and GitNexus findings. |

Rules:

1. If any prerequisite is missing, ask the user or record an explicit assumption before planning.
2. `--fast` may use a compact contract table, but it cannot skip the contract, risk gate, or checklist.
3. Create or update `.agent/artifacts/<run-id>/context-snippets.json` and `.agent/artifacts/<run-id>/risk-gate.json`.
4. If `risk-gate.json` blocks the run, stop before task breakdown.

### Phase 3: Plan Creation

1. Break feature into tasks (max 5-8 per plan)
2. Define dependencies between tasks
3. Estimate complexity (S/M/L/XL) — use past lessons for calibration
4. Define acceptance criteria per task
5. Define test requirements per task
6. Create `docs/plans/{feature-slug}.md`
7. Include the 5-part contract in the plan output.

### Phase 4: Update Tracking

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

### Phase 5: Next Steps

- `/design` → Design database & architecture
- `/code` → Start implementing
