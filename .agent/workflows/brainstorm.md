---
name: brainstorm
description: Structured brainstorming with memory integration
---

# /brainstorm — Think Before You Build

## Trigger

User types `/brainstorm`

## Steps

### Phase 1: Context + Recall

1. Read `.planning/STATE.md` — current project state
2. Read `.planning/REQUIREMENTS.md` — existing requirements
3. **AUTO-RECALL related knowledge:**
   ```bash
   # MCP:
   mcp_second-brain_recall(query="{topic user wants to brainstorm}")
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py recall "{topic}"
   ```
4. Report recalled context: past decisions, rejected approaches, lessons

### Phase 2: Socratic Questions

Ask minimum 3 strategic questions:

1. **Goal**: What specific problem does this solve?
2. **Users**: Who will use this and how?
3. **Scope**: What's the minimum viable version?
4. **Constraints**: Budget? Timeline? Tech stack locked?
5. **Success**: How do we know this is done right?

> 🔴 **Wait for answers before proceeding.**

### Phase 3: Options Analysis

Present 2-3 options with trade-offs:

```markdown
### Option A: {Name}

- Pros: ...
- Cons: ...
- Effort: S/M/L
- Fits project because: {reference ARCHITECTURE.md}

### Option B: {Name}

- Pros: ...
- Cons: ...
- Effort: S/M/L
- Doesn't fit because: {reference constraints}

### Recommendation: Option {X}
```

### Phase 4: Decision + Remember

After user decides:

1. **AUTO-REMEMBER the decision:**
   ```bash
   # MCP:
   mcp_second-brain_remember(
     topic="Brainstorm decision: {topic}",
     detail="Chose: {option}. Rejected: {options}. Reason: {why}.",
     tags=["decision", "brainstorm", "{domain}"]
   )
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py remember \
     "Brainstorm: {topic}" \
     "Chose {option} because {reason}. Rejected {alternatives}." \
     --tags decision brainstorm --type decision
   ```
2. Update `.planning/REQUIREMENTS.md` if needed
3. Update `.planning/STATE.md`

### Phase 5: Next Steps

- 🚀 `/ba-pipeline` → **Full-Auto**: Use Case → User Story → Plan (tự chạy hết)
- `/plan` → Create implementation plan (manual step-by-step)
- `/design` → Technical design
- `/code` → Start coding (if simple enough)

> 💡 **Tip**: Nếu user muốn AI tự động chạy hết pipeline BA mà không cần gõ từng lệnh,
> gợi ý `/ba-pipeline` hoặc `/ba`. AI sẽ tự viết Use Case, tách User Story, lên Plan
> mà chỉ dừng 1 lần duy nhất ở cuối để user review.
