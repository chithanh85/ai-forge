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

## 🔴 5-Persona Debate Protocol (MANDATORY for Architecture/System Design)

**Before finalizing any high-impact technical decision, architecture design, or option analysis:**

Simulate a structured debate among 5 personas representing different perspectives. Act as the orchestrator and write the highlights of this debate directly in your brainstorming output, Socratic gate responses, or plan references:

1. **Tech Lead (Architecture & Standards)**:
   - Evaluates: Design elegance, pattern compliance, maintainability, avoiding over-engineering (Karpathy's rules).
   - _Key Focus_: "How can we write the minimum code possible? Does it match existing codebase conventions?"

2. **Security Expert (Threat & Security Gates)**:
   - Evaluates: Data protection, input validation, authentication, authorization, secret management.
   - _Key Focus_: "What if malicious input is provided? Are there credentials or secrets exposed?"

3. **UX/UI Specialist (User Experience & Consistency)**:
   - Evaluates: Visual hierarchy, accessibility, design tokens compliance (Tailwind v4 / Vanilla CSS), layout usability.
   - _Key Focus_: "Does this follow the 6-pillar visual audit rules? Is the user interface clean, elegant, and responsive?"

4. **QA Automation Engineer (Verification & Testability)**:
   - Evaluates: Test pyramid coverage, unit test capability, TDD viability, edge cases.
   - _Key Focus_: "How will we test this? What are the Happy, Sad, and Edge paths?"

5. **Product Owner (Value, Scope & Constraints)**:
   - Evaluates: MVP constraints, business requirements, estimated effort, and out-of-scope boundaries.
   - _Key Focus_: "Does this directly solve the user request? Is this within the scope boundary?"

### How to Document the Debate:

Outline the debate trade-offs inside your brainstorming options analysis or in `docs/plans/active/{slug}/references/architecture_debate.md`. Example:

> **5-Persona Debate Highlights**:
>
> - **Tech Lead**: "Option A is too complex; let's write a simple 30-line helper instead."
> - **Security**: "Agree, but we must make sure helper inputs are sanitized."
> - **UX**: "Ensure warning alerts follow our design system theme."
> - **QA**: "Write unit tests targeting the validation limits."
> - **Product Owner**: "Keep features out of scope that are not in the primary user request."

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
