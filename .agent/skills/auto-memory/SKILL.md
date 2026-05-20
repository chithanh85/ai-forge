---
name: auto-memory
description: "Auto-activates at workflow boundaries. Saves lessons, decisions, and incidents to Second Brain. Recalls relevant context at session start."
allowed-tools: Read, Write, Edit
version: 1.0
priority: CRITICAL
auto-trigger: true
---

# Auto Memory — Never Forget, Never Repeat Mistakes

> **This skill is INVISIBLE to the user. It auto-triggers at key moments.**

## Auto-Trigger Points

| Moment                          | Action       | What to Save/Recall                         |
| ------------------------------- | ------------ | ------------------------------------------- |
| **Session start**               | `recall()`   | Project context, recent decisions, blockers |
| **After /brainstorm**           | `remember()` | Requirements, decisions, rejected options   |
| **After /code**                 | `remember()` | Lessons learned during implementation       |
| **After /debug**                | `remember()` | Root cause, fix, prevention note            |
| **After /deploy**               | `remember()` | Deploy result, rollback info                |
| **After fixing a bug**          | `remember()` | Symptom → root cause → fix → guardrail      |
| **After architecture decision** | `remember()` | ADR: what, why, trade-offs                  |
| **Before /test**                | `recall()`   | Past test failures, flaky tests             |
| **Before /deploy**              | `recall()`   | Past deploy issues, rollback procedures     |

---

## Memory Operations

### remember(data) — Save to Second Brain

```
When to call:
- End of any workflow that produced a decision or lesson
- After fixing a bug (MANDATORY)
- After architecture decision
- When user explicitly says something important

What to save:
{
  "type": "lesson|decision|incident|pattern",
  "context": "{project name, module, feature}",
  "summary": "{one-line summary}",
  "detail": "{full explanation}",
  "tags": ["relevant", "tags"],
  "related_files": ["path/to/file"],
  "timestamp": "ISO-8601"
}
```

### recall(query) — Retrieve from Second Brain

```
When to call:
- Start of any non-trivial task
- Before making architecture decisions
- Before debugging (check past similar bugs)
- Before deploying (check past deploy issues)

How to query:
- By concept: recall("authentication patterns")
- By file: recall("UserService bugs")
- By incident: recall("production outages")
```

---

## Implementation: MCP Integration

The Second Brain is accessed via MCP tools. Configure in your AI environment:

### Option 1: Cloudflare Worker (Recommended, Free)

```json
{
  "mcpServers": {
    "second-brain": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic/mcp-remote",
        "https://YOUR-WORKER.workers.dev/sse"
      ],
      "env": {
        "AUTH_TOKEN": "${SECOND_BRAIN_TOKEN}"
      }
    }
  }
}
```

MCP Tools available:

- `mcp_second-brain_remember` — store knowledge
- `mcp_second-brain_recall` — semantic search
- `mcp_second-brain_append` — update existing entry
- `mcp_second-brain_list_recent` — recent entries
- `mcp_second-brain_forget` — delete outdated

### Option 2: Local Fallback (No Cloudflare)

If Second Brain MCP is not configured, use local file-based memory:

**Save to:** `docs/wiki/lessons/{date}-{slug}.md`
**Index:** `docs/wiki-index.md`

```markdown
# Lesson: {Title}

**Date:** {ISO date}
**Type:** lesson|decision|incident
**Tags:** #{tag1} #{tag2}

## Context

{What was happening}

## Detail

{What was learned / decided / fixed}

## Related Files

- `path/to/file.ts`
```

---

## Auto-Save Rules

### After Bug Fix (MANDATORY)

```markdown
remember({
type: "incident",
summary: "Fixed {symptom} in {module}",
detail: "Root cause: {cause}. Fix: {fix}. Guardrail: {test added}.",
tags: ["bugfix", "{module}"]
})
```

### After Architecture Decision

```markdown
remember({
type: "decision",
summary: "Chose {X} over {Y} for {purpose}",
detail: "Trade-offs: {pros/cons}. Context: {constraints}.",
tags: ["architecture", "{domain}"]
})
```

### After Deployment

```markdown
remember({
type: "lesson",
summary: "Deployed {version} to {env}",
detail: "Changes: {summary}. Issues: {any}. Rollback: {tested?}.",
tags: ["deploy", "{env}"]
})
```

---

## Deduplication

Before saving, check if similar knowledge exists:

1. `recall()` with the same topic
2. If match > 90% similarity → `append()` to existing entry
3. If no match → `remember()` new entry

---

## Anti-Patterns

| ❌ Don't                               | ✅ Do                           |
| -------------------------------------- | ------------------------------- |
| Save raw conversation                  | Save distilled lessons          |
| Save code snippets                     | Save patterns and decisions     |
| Forget to recall before debugging      | Always recall past similar bugs |
| Save without tags                      | Always tag by module and type   |
| Save trivial things ("changed a typo") | Save only decisions and lessons |
