---
name: design
description: Architecture and database design with memory
---

# /design — Technical Design + Memory

## Trigger

User types `/design`

## Steps

### Phase 1: Context + Recall

1. Read plan from `docs/plans/active/`
2. Activate agent: `database-architect` + `backend-specialist`
3. Load skill: `database-design`, `api-patterns`, `system-design`
4. **AUTO-RECALL past architecture decisions:**
   ```bash
   # MCP:
   mcp_second-brain_recall(query="{feature} architecture database design")
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py recall "{feature} design"
   ```
5. Report: past related decisions and patterns

### Phase 2: Database Design

1. Design schema following DB Standards (see `@[skills/database-design]`)
2. Write migration files
3. Define relationships and constraints
4. Create ERD diagram (mermaid)

### Phase 3: API Design

1. Check existing API patterns first: `grep -r '@Get\|@Post\|router' src/`
2. Define endpoints matching existing style
3. Define request/response schemas
4. Plan authentication/authorization
5. Document in `specs/`

### Phase 4: Architecture Decision Record

1. Create ADR in `docs/adr/`
2. Document alternatives considered
3. Record decision and rationale
4. **AUTO-REMEMBER the ADR:**
   ```bash
   # MCP:
   mcp_second-brain_remember(
     topic="ADR: {decision title}",
     detail="Chose {X} over {Y}. Reason: {why}. Trade-offs: {what}.",
     tags=["architecture", "adr", "{domain}"]
   )
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py remember \
     "ADR: {title}" "Chose {X} over {Y}. Reason: {why}." \
     --tags architecture adr --type decision
   ```

### Phase 5: Next Steps

- `/code` → Start implementing
- `/plan` → Refine plan based on design
