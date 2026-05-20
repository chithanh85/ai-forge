---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

---

## 🔴 MANDATORY: Context Loading (Auto-injected)

Before applying this skill, load project context:

1. Read `ARCHITECTURE.md` or `CODEBASE_INDEX.md` — understand current system
2. Check related existing code — `grep` for patterns this skill covers
3. Read `.planning/STATE.md` — understand current project phase
4. `recall()` from Second Brain — past lessons in this domain

> **RULE:** Never apply skill knowledge without checking what the project already does.
> **RULE:** Consistency with existing code > theoretical perfection.

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:

1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.

---

## Related Skills

| Skill                                              | Phase          | When to Use                                                     |
| -------------------------------------------------- | -------------- | --------------------------------------------------------------- |
| **[frontend-design](../frontend-design/SKILL.md)** | 1. THINK       | Before coding — Learn design principles, UX psychology          |
| **[ui-ux-pro-max](../ui-ux-pro-max/SKILL.md)**     | 2. GENERATE    | Data-driven design system — 161 industries, 67 styles, 57 fonts |
| **[design-tokens](../design-tokens/SKILL.md)**     | 3. STANDARDIZE | Convert to DESIGN.md format — lint, WCAG, export to Tailwind    |
| **web-design-guidelines** (this)                   | 4. AUDIT       | After coding — Accessibility, performance, best practices       |

## Design Workflow

```
1. THINK       → frontend-design principles
2. GENERATE    → ui-ux-pro-max --design-system
3. STANDARDIZE → design-tokens → DESIGN.md
4. CODE        → Implement using design system
5. AUDIT       → web-design-guidelines review ← YOU ARE HERE
```
