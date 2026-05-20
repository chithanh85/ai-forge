---
name: brainstorming
description: "Use for complex requests, new features, or unclear requirements. Enforces Socratic Gate before implementation."
allowed-tools: Read, Write, Edit
version: 2.0
priority: CRITICAL
---

# Brainstorming — Think Before You Build

> **The most expensive code is code that solves the wrong problem.**

## When This Skill Activates

| Trigger                                  | Example                        |
| ---------------------------------------- | ------------------------------ |
| New feature request                      | "Add payment system"           |
| Unclear requirements                     | "Make it faster"               |
| Architecture decision                    | "Should we use microservices?" |
| `/brainstorm` workflow                   | Full BA analysis               |
| Complex task (multi-file, multi-service) | Automatic Socratic Gate        |

---

## 🔴 Socratic Gate (MANDATORY)

**Before writing ANY code for a complex request:**

### Step 1: Ask minimum 3 strategic questions

```markdown
Before I start, I need to understand:

1. **Goal**: What specific problem does this solve?
2. **Users**: Who will use this and how?
3. **Scope**: What's the minimum viable version?
4. **Constraints**: Budget? Timeline? Tech stack locked?
5. **Success**: How do we know this is done right?
```

### Step 2: Wait for answers

> 🔴 **VIOLATION:** Writing code before user answers questions.

### Step 3: Summarize understanding

```markdown
## My Understanding

- Problem: {X}
- Solution: {Y}
- Out of scope: {Z}
- Success criteria: {W}

**Is this correct?**
```

### Step 4: Only then proceed to implementation

---

## 🔴 Context Loading

```
1. Read .planning/STATE.md — what's the current project state?
2. Read .planning/REQUIREMENTS.md — what's already defined?
3. recall() from Second Brain — similar features built before?
4. Check ARCHITECTURE.md — what are the current boundaries?
```

---

## Options Analysis Template

For significant decisions, present options:

```markdown
## Options Analysis: {Decision}

### Option A: {Name}

- **Pros**: ...
- **Cons**: ...
- **Effort**: S/M/L
- **Risk**: Low/Medium/High
- **Fits because**: {reference to project constraints}

### Option B: {Name}

- **Pros**: ...
- **Cons**: ...
- **Effort**: S/M/L
- **Risk**: Low/Medium/High
- **Doesn't fit because**: {reference to project constraints}

### Recommendation: Option {X}

**Reason**: {Based on project context, not theory}
```

---

## 🔗 Cross-References

| After brainstorming             | Next Skill                  |
| ------------------------------- | --------------------------- |
| Requirements clear → plan tasks | `@[skills/plan-writing]`    |
| Architecture needed             | `@[skills/system-design]`   |
| Database design needed          | `@[skills/database-design]` |
| UI/UX design needed             | `@[skills/frontend-design]` |

---

## Anti-Patterns

| ❌ Don't                     | ✅ Do                                   |
| ---------------------------- | --------------------------------------- |
| Jump to code immediately     | Ask questions first                     |
| Assume requirements          | Verify with user                        |
| Propose one solution         | Present 2-3 options with trade-offs     |
| Ignore project context       | Read STATE.md and ARCHITECTURE.md first |
| Over-brainstorm simple tasks | Single-file fix? Just do it             |
