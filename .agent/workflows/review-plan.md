---
name: review-plan
description: Run parallel architecture and experience review for a split plan before implementation.
---

# /review-plan - Parallel Plan Review Gate

## Trigger

User types `/review-plan <slug>` or a workflow reaches the plan review gate.

## Required Inputs

- Split plan folder: `docs/plans/<slug>/`
- Active phase marker: `docs/plans/<slug>/current-phase.txt`
- Run artifacts directory: `.agent/artifacts/<run-id>/`
- Risk gate: `.agent/artifacts/<run-id>/risk-gate.json`

## Steps

1. Hydrate only the active phase:
   ```bash
   python .agent/scripts/plan_hydrate.py context <slug>
   ```
2. Run the rationalization check from
   `.agent/rules/rationalization-prevention.md` before accepting shortcuts.
3. Dispatch both reviewers in parallel:
   - `@[agents/architecture-reviewer]`
   - `@[agents/experience-reviewer]`
4. Each reviewer returns:
   - `name`
   - `decision`
   - `score` from 0 to 5
   - `findings`
   - `required_followups`
5. Write `.agent/artifacts/<run-id>/review-decision.json`:
   ```json
   {
     "schema": "awf.review-decision.v1",
     "run_id": "<run-id>",
     "reviewer": "review-plan",
     "decision": "APPROVE",
     "reviewers": [
       {
         "name": "architecture-reviewer",
         "decision": "APPROVE",
         "score": 4,
         "findings": [],
         "required_followups": []
       },
       {
         "name": "experience-reviewer",
         "decision": "APPROVE",
         "score": 4,
         "findings": [],
         "required_followups": []
       }
     ],
     "findings": [],
     "required_followups": []
   }
   ```

## Gate

- Any reviewer `decision: "BLOCK"` blocks implementation.
- Any reviewer score below `3` blocks implementation.
- `python .agent/scripts/checklist.py .` must pass before `/code`.
