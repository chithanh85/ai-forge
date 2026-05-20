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

### Phase 2: Isolate

1. Narrow down to specific module/function
2. Use binary search / git bisect if needed
3. Check if this matches any recalled past bugs

### Phase 3: Root Cause

1. Read code carefully — do NOT fix blindly
2. Add strategic logging if needed
3. Check edge cases
4. Identify the ACTUAL root cause (not symptoms)

### Phase 4: Fix & Verify

1. Write regression test FIRST (lock the bug)
2. Apply minimal fix
3. Run full test suite
4. Verify fix doesn't break other things

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
