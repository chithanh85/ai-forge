---
name: plan-writing
description: "Use when breaking features into tasks, estimating complexity, or creating implementation plans. Reads project state before planning."
allowed-tools: Read, Write, Edit
version: 2.0
---

# Plan Writing — Structure Before Speed

> **A plan is not bureaucracy. It's the cheapest way to find problems.**

## When This Skill Activates

| Trigger                  | Example                     |
| ------------------------ | --------------------------- |
| Feature with 3+ tasks    | "Implement user dashboard"  |
| Multi-day implementation | "Add payment integration"   |
| Refactoring              | "Migrate from REST to tRPC" |
| `/plan` workflow         | Task breakdown              |

---

## 🔴 Context Loading Before Planning

```
1. Read .planning/STATE.md — current progress, blockers
2. Read .planning/ROADMAP.md — where does this feature fit?
3. Read .planning/REQUIREMENTS.md — what's already defined?
4. Check docs/plans/ — any existing plans for this area?
5. recall() related lessons from past implementations
```

---

## Plan Template

Create as `docs/plans/{feature-slug}.md`:

```markdown
# Plan: {Feature Name}

**Status**: Draft | In Progress | Done
**Created**: {date}
**Estimated**: {S/M/L/XL}

## Context

{What problem does this solve? Link to requirements.}

## Tasks

### Task 1: {Name}

- **Files**: {which files to create/modify}
- **Dependencies**: {what must be done first}
- **Estimate**: S (1-2h) / M (2-4h) / L (4-8h) / XL (8h+)
- **Acceptance**: {how to verify this task is done}
- **Tests**: {what tests to write}

### Task 2: {Name}

...

## Out of Scope

- {Explicitly state what this plan does NOT cover}

## Risks

- {What could go wrong? What's the mitigation?}

## Verification

- [ ] All tasks have acceptance criteria
- [ ] All tasks have test requirements
- [ ] Dependencies are in correct order
- [ ] Total effort is realistic
```

---

## Estimation Guide

| Size   | Time | Characteristics                         |
| ------ | ---- | --------------------------------------- |
| **S**  | 1-2h | Single file, clear requirements         |
| **M**  | 2-4h | 2-3 files, some decisions needed        |
| **L**  | 4-8h | Multi-file, integration, tests          |
| **XL** | 8h+  | Cross-service, migration, complex logic |

> **If a task is XL, split it into smaller tasks.**

---

## After Plan Is Done

Update project tracking:

- [ ] `.planning/STATE.md` → current task reference
- [ ] `.planning/ROADMAP.md` → feature added to timeline
- [ ] `.planning/MILESTONES.md` → if this is a milestone

---

## 🔗 Cross-References

| From plan to...     | Skill                        |
| ------------------- | ---------------------------- |
| Architecture design | `@[skills/system-design]`    |
| Database design     | `@[skills/database-design]`  |
| API design          | `@[skills/api-patterns]`     |
| Implementation      | `@[skills/clean-code]`       |
| Testing             | `@[skills/testing-patterns]` |

---

## Anti-Patterns

| ❌ Don't                          | ✅ Do                            |
| --------------------------------- | -------------------------------- |
| Plan without reading STATE.md     | Always check current state first |
| Tasks without acceptance criteria | Every task must be verifiable    |
| One giant task                    | Split into S/M tasks             |
| Plan without asking questions     | Brainstorm first if unclear      |
| Over-plan simple fixes            | Single-file fix? Skip the plan   |
