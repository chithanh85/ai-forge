---
name: debug
description: Systematic debugging with auto memory
---

# /debug — Systematic Debugging + Memory

## Trigger

User types `/debug`

## Steps

### Phase 1: Reproduce + Recall

1. Understand the symptom from user
2. **AUTO-RECALL past similar bugs:**
   ```bash
   # MCP:
   mcp_second-brain_recall(query="{error message or symptom}")
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py recall "{symptom}"
   ```
3. Report to user: "Found X past related bugs" (if any)
4. Find minimal reproduction steps
5. Identify affected code area

### Phase 1A: Scout (Mandatory Before Any Fix Proposal)

1. Read relevant state, plan, rules, and recalled lessons.
2. If a split plan is relevant, hydrate only the active phase with `python .agent/scripts/plan_hydrate.py context {feature-slug}`.
3. Read `.agent/rules/rationalization-prevention.md`.
4. Identify likely files/modules without editing.
5. Search nearby conventions in related files and docs.
6. Run recent history:
   ```bash
   git log -20 -- <suspected-path>
   # If no path is known yet:
   git log -20 --oneline
   ```
7. Use GitNexus when code symbols or route handlers are involved:
   - `gitnexus_context({name: "<symbol>"})` for callers/callees and flow context.
   - `gitnexus_impact({target: "<symbol>", direction: "upstream"})` before any symbol edit.
   - `gitnexus_api_impact(...)` before route-handler edits.
8. Write/update `.agent/artifacts/<run-id>/context-snippets.json` with selected evidence.

### Phase 1B: Diagnose (Mandatory Gate)

1. Reproduce the issue, or state exactly why reproduction is blocked.
2. Separate:
   - Symptom
   - Suspected cause
   - Confirmed cause
   - Unknowns
3. Write/update `.agent/artifacts/<run-id>/risk-gate.json`.
4. If GitNexus returns HIGH or CRITICAL impact, or `risk-gate.json` has `decision: BLOCK`, stop and ask for explicit user approval before proposing edits.
5. Run the rationalization-prevention check before proposing edits and record it in `adversarial-validation.json`.
6. Only after `context-snippets.json` and `risk-gate.json` exist may the workflow propose a minimal fix and regression test.

### Phase 2: Isolate (Fast Debugging Methodology)

1. **Create an MRE (Minimal Reproducible Example):** Isolate the bug into the smallest possible script or data payload. Do NOT debug on the full dataset or full architecture if a smaller one reproduces the issue.
2. **Atomic Debug Cycles:** Ensure your debug run is a single fast command (e.g., `rm data && ./run.sh`).
3. **Divide & Conquer (Bisection):** Narrow down to the specific module/function using binary search or `git bisect` if the cause is a recent regression.
4. Check if this matches any recalled past bugs.

### Phase 3: Root Cause

1. Read code carefully — do NOT fix blindly
2. Add strategic logging if needed
3. Check edge cases
4. Identify the ACTUAL root cause (not symptoms)

### Phase 4: Fix & Verify

1. For risky or complex fixes, allocate a Git Worktree to write the regression test and execute the fix in isolation:
   ```bash
   python .agent/scripts/worktree_runner.py run --run-id {run-id} --task {task-title} --agent-id debugger --agent-role debugger --cleanup on-success -- <command-to-execute>
   ```
2. Write regression test FIRST (lock the bug)
3. Apply minimal fix
4. Run full test suite
5. Verify fix doesn't break other things
6. Write/update:
   - `.agent/artifacts/<run-id>/verification.json`
   - `.agent/artifacts/<run-id>/review-decision.json`
   - `.agent/artifacts/<run-id>/adversarial-validation.json`
7. Run `python .agent/scripts/checklist.py .`; artifact gate failures block completion.

### Phase 5: Learn (MANDATORY)

> 🔴 **This phase is NOT optional. Every bug fix MUST save its lesson.**

1. **AUTO-REMEMBER (MANDATORY):**
   ```bash
   # MCP:
   mcp_second-brain_remember(
     topic="Fixed: {one-line symptom}",
     detail="Symptom: {what happened}\nRoot cause: {why}\nFix: {what changed}\nGuardrail: {test added}\nPrevention: {how to prevent}",
     tags=["bugfix", "{module}", "{category}"]
   )
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py remember \
     "Fixed: {symptom}" \
     "Root cause: {cause}. Fix: {fix}. Guardrail: {test}." \
     --tags bugfix module --type incident
   ```
2. Update `.planning/STATE.md`

### Phase 6: Next Steps

- `/test` → Verify full suite
- `/code` → Continue development
