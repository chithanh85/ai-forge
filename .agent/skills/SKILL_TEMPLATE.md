# Skill Template Pattern

> **Every skill in this template MUST follow this pattern. No static knowledge dumps.**

## Required Sections in SKILL.md

```markdown
---
name: { skill-name }
description: "{When to use — verifiable trigger condition}"
allowed-tools: Read, Write, Edit, Glob, Grep, RunCommand
version: 2.0
---

# {Skill Name} — {Action Verb, not noun}

> One-line philosophy

## When This Skill Activates

| Trigger | Example |
(list of concrete situations that activate this skill)

## 🔴 MANDATORY: Context Loading

(what project files to read BEFORE giving advice)

## Decision Framework

(project-aware questions, not theory)

## 🔗 Cross-References

(which other skills to defer to)

## Verification

(script to run, or checklist to validate)

## Anti-Patterns

(what NOT to do, in project context)
```

## Key Principles

1. **Every file starts with "Check YOUR project first"**
2. **Every decision table asks about the actual codebase**
3. **Every section cross-references related skills**
4. **Every skill has a verification method** (script or checklist)
5. **No theory without "Apply to your project" action**

## Anti-Patterns for Skill Writing

| ❌ Static                | ✅ Dynamic                                                              |
| ------------------------ | ----------------------------------------------------------------------- |
| "Redis is a cache"       | "Check docker-compose.yml: do you have Redis?"                          |
| "Use JWT for auth"       | "Grep for 'passport/jwt/session' — what does your project already use?" |
| "SOLID principles"       | "Before editing, run: grep imports to find dependent files"             |
| "Here's how OAuth works" | "Check .env: what auth provider keys exist?"                            |
