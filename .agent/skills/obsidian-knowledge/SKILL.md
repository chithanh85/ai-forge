---
name: obsidian-knowledge
description: Traverse and query the conceptual Obsidian Knowledge Graph of the project
---

# Obsidian Knowledge Graph Skill

---

## 🔴 MANDATORY: Context Loading (Auto-injected)

Before applying this skill, load project context:

1. Read `ARCHITECTURE.md` or `CODEBASE_INDEX.md` — understand current system
2. Check related existing code — `grep` for patterns this skill covers
3. Read `.planning/STATE.md` — understand current project phase
4. `recall()` from Second Brain — past lessons in this domain

> **RULE:** Never apply skill knowledge without checking what the project already does.
> **RULE:** Consistency with existing code > theoretical perfection.

This skill allows the AI to traverse the manual, human-crafted knowledge graph (Obsidian Vault) created by the developer. It is the conceptual counterpart to GitNexus.

## When to Use

- When you need to understand architectural decisions, SOPs, rules, or conceptual logic.
- When you see a reference to an Obsidian tag (e.g., `#architecture`) or a Wikilink (e.g., `[[system-status]]`).
- When you need to find all documents related to a specific feature concept.

## Available CLI Tool

You have access to a dedicated Python CLI tool: `.agent/scripts/obsidian_graph.py`.

### Commands

1. **Map the Vault:** (See how many files exist)

   ```bash
   python .agent/scripts/obsidian_graph.py map
   ```

   For machine-readable output:

   ```bash
   python .agent/scripts/obsidian_graph.py map --json
   ```

2. **Get Info on a File:** (Shows tags, outbound links, and backlinks)

   ```bash
   python .agent/scripts/obsidian_graph.py info "ARCHITECTURE"
   ```

3. **Get Backlinks:** (Find all documents that link TO a specific concept)

   ```bash
   python .agent/scripts/obsidian_graph.py backlinks "system-status"
   ```

4. **Search by Tag:** (Find all documents containing a specific tag)
   ```bash
   python .agent/scripts/obsidian_graph.py tag "#sops"
   ```

## Best Practices for AI

1. **Use It in Preflight**: Default repo preflight is `CODEBASE_INDEX.md` first, then `docs/wiki-index.md`, then `python .agent/scripts/obsidian_graph.py info <concept>`, then GitNexus for code navigation.
2. **Use the Wiki Layer**: For architecture/process/source questions, consult `docs/wiki-index.md` and relevant `docs/wiki/*` pages before opening huge canonical docs.
3. **Follow the Graph**: If a user asks you to implement a task based on `docs/plans/feature-x.md`, first run the `info` command on that file. If it has outbound links to other architecture files, you MUST read those files too.
4. **Backlink Discovery**: If you are modifying a core rule file like `AGENTS.md`, run `backlinks "AGENTS"` to see if any task plans or workflow docs depend on it.
5. **Maintain Wiki Hygiene**: If you add or materially change `docs/wiki/*`, update `docs/wiki-index.md`, append `docs/wiki-log.md`, and run `pnpm run wiki:lint`.
6. **Ignore Noise Intentionally**: The CLI respects `.obsidian-graph-ignore` at repo root. Add vendored or archival trees there to keep conceptual scans focused and token-cheap.
7. **No Assumptions**: The Obsidian graph represents the explicit rules set by the human developer. Treat its contents as high-priority constraints.
