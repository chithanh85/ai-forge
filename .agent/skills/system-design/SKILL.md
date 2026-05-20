---
name: system-design
description: "Use when making architecture decisions, scaling analysis, technology selection, or designing new systems/features. Connects to project context via ARCHITECTURE.md, database schemas, and deployment config. Triggers automatically when task involves infrastructure, scaling, data flow, or system boundaries."
allowed-tools: Read, Write, Edit, Glob, Grep, RunCommand
version: 2.0
priority: HIGH
---

# System Design — Contextual Decision Framework

> **This skill does NOT teach theory. It guides decisions using YOUR project's context.**
> Reference: [karanpratapsingh/system-design](https://github.com/karanpratapsingh/system-design) (43k+ ⭐)

## When This Skill Activates

| Trigger                               | Example                               |
| ------------------------------------- | ------------------------------------- |
| New feature touches multiple services | "Add real-time notifications"         |
| Database schema design or change      | "Design the payments table"           |
| Scaling/performance discussion        | "How to handle 10k concurrent users?" |
| Technology selection                  | "Should we use Redis or Memcached?"   |
| API design or protocol choice         | "REST vs GraphQL for this service?"   |
| Infrastructure decisions              | "Do we need a message queue?"         |
| `/design` workflow Phase 3            | Architecture Decision Record          |

---

## 🔴 MANDATORY: Context Loading Before Any Design Decision

**Before giving ANY system design advice, load project context:**

```
1. Read ARCHITECTURE.md (or CODEBASE_INDEX.md if exists)
   → Understand current system boundaries, tech stack, deployment
2. Read docs/wiki-index.md
   → Check if similar decisions were already made
3. Check existing schemas
   → database/migrations/ or prisma/schema.prisma or similar
4. Check deployment config
   → docker-compose.yml, Dockerfile, .github/workflows/
5. recall() from Second Brain
   → Past lessons about scaling, incidents, failed approaches
```

> 🔴 **VIOLATION:** Recommending a pattern without checking if the project already uses an incompatible one.

---

## Decision Framework (Project-Aware)

### Step 1: Classify the Decision

| Type              | Read These Project Files First                                  |
| ----------------- | --------------------------------------------------------------- |
| **Database**      | Current schema files, `@[skills/database-design]`               |
| **API**           | Existing API routes, `@[skills/api-patterns]`                   |
| **Caching**       | Current Redis/cache usage, env files                            |
| **Messaging**     | Existing queue/event setup, docker-compose                      |
| **Scaling**       | Deployment config, monitoring dashboards                        |
| **Auth/Security** | Auth middleware, env secrets, `@[skills/vulnerability-scanner]` |

### Step 2: Assess Current Scale

Before recommending anything, measure first:

```
Questions to answer FROM the project:
- How many users does the project currently serve?
- What's the current DB size?
- What's the deployment topology? (single server? multi-region?)
- What's the team size? (1 dev ≠ microservices)
- What's the budget constraint?
```

### Step 3: Apply the "Do You Actually Need This?" Gate

| Pattern        | You Need It When                                   | You DON'T Need It When              |
| -------------- | -------------------------------------------------- | ----------------------------------- |
| Microservices  | >10 devs, different scaling needs per service      | <5 devs, everything scales together |
| Message Queue  | Async processing, decoupled services               | Simple request-response is fine     |
| Caching Layer  | Same data read >10x per write                      | Data changes every request          |
| Sharding       | Single DB can't handle load after vertical scaling | DB is <100GB and load is manageable |
| Event Sourcing | Full audit trail required by business              | Simple CRUD app                     |
| CQRS           | Read/write patterns fundamentally different        | Same model works for both           |

---

## 🔗 Skill Cross-References

| Decision Domain | Defer To Skill                    | Why                                  |
| --------------- | --------------------------------- | ------------------------------------ |
| Database schema | `@[skills/database-design]`       | UUID, indexing, N+1 prevention rules |
| API contract    | `@[skills/api-patterns]`          | REST/GraphQL/tRPC, versioning        |
| Deployment      | `@[skills/deployment-procedures]` | Docker, CI/CD, rollback              |
| Security/Auth   | `@[skills/vulnerability-scanner]` | OWASP, secrets, TLS                  |
| Performance     | `@[skills/performance-profiling]` | Measure before optimize              |
| Server infra    | `@[skills/server-management]`     | Process management, monitoring       |

---

## Reference Files (Read Only When Needed)

| File                | Content                                         | Read When                           |
| ------------------- | ----------------------------------------------- | ----------------------------------- |
| `networking.md`     | IP, OSI, TCP/UDP, DNS                           | Networking infrastructure decisions |
| `load-balancing.md` | LB algorithms, clustering, HA                   | Scaling infrastructure              |
| `caching.md`        | Write-through/back/around, CDN                  | Adding caching layer                |
| `databases.md`      | SQL/NoSQL, CAP, sharding, replication           | Database architecture               |
| `messaging.md`      | Queues, Pub/Sub, Event Sourcing, CQRS           | Adding async communication          |
| `architecture.md`   | Monolith→Microservices, API Gateway             | Architecture evolution              |
| `reliability.md`    | Availability nines, circuit breaker, DR         | Resilience decisions                |
| `security.md`       | OAuth, OIDC, SSO, TLS/mTLS                      | Auth architecture                   |
| `case-studies.md`   | URL Shortener, WhatsApp, Twitter, Netflix, Uber | Real-world reference                |

---

## Verification: `system_design_audit.py`

After any architecture decision, run:

```bash
python .agent/skills/system-design/scripts/system_design_audit.py .
```

This audits the project for:

- Single points of failure
- Missing health checks
- Inconsistent env config
- Database without indexes on FKs
- Hardcoded URLs/ports
- Missing rate limiting
- No circuit breaker on external calls

---

## Output Format for Architecture Decisions

When making a system design decision, ALWAYS document as ADR:

```markdown
## ADR-{number}: {Title}

**Status:** Proposed | Accepted | Deprecated
**Date:** {date}
**Context:** {What problem are we solving? Link to project files.}
**Current State:** {What does ARCHITECTURE.md say about this area?}
**Options Considered:**

1. {Option A} — Pros: ... | Cons: ... | Fits project because: ...
2. {Option B} — Pros: ... | Cons: ... | Doesn't fit because: ...
   **Decision:** {Which option and WHY, referencing project constraints}
   **Consequences:** {What changes in the project? Which files affected?}
   **Migration Path:** {How do we get from current state to new state?}
```

> 🔴 **RULE:** Every ADR must reference at least one actual project file.
> 🔴 **RULE:** Never recommend a pattern without a migration path from current state.

---

## Anti-Patterns

| ❌ Don't                                  | ✅ Do                                          |
| ----------------------------------------- | ---------------------------------------------- |
| Dump theory without project context       | Read ARCHITECTURE.md first, then advise        |
| Recommend microservices for a solo dev    | Match pattern to team size and scale           |
| Copy patterns from case studies blindly   | Adapt patterns to current project constraints  |
| Ignore what's already built               | Build on existing architecture, don't rebuild  |
| Skip the "Do you need this?" gate         | Always prove the need before adding complexity |
| Design without checking deployment config | Ensure design works with current infra         |
