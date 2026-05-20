# Database Architecture — Decision Guide

> **Don't read this file as theory. Use it to make decisions for YOUR project.**
> For schema-level rules (UUID, indexes, timestamps), see `@[skills/database-design]`.

## 🔴 Before Making Any Database Decision

```
1. Check current schema: database/migrations/ OR prisma/schema.prisma OR *.sql
2. Check docker-compose.yml: which DB is already in use?
3. Check .env files: what DB connection strings exist?
4. recall() from Second Brain: past DB incidents or lessons
```

---

## SQL vs NoSQL — Project Decision Matrix

**Ask these about YOUR project, not in abstract:**

| Question                                        | If YES → SQL | If YES → NoSQL |
| ----------------------------------------------- | ------------ | -------------- |
| Does data have clear relationships (FK, JOINs)? | ✅           |                |
| Do you need ACID transactions?                  | ✅           |                |
| Is the schema well-known and stable?            | ✅           |                |
| Does schema change frequently?                  |              | ✅             |
| Is read/write ratio > 100:1 at massive scale?   |              | ✅             |
| Do you need horizontal scaling to 10+ nodes?    |              | ✅             |

> **Default:** Start with PostgreSQL. Switch only when you hit a measured bottleneck.

---

## CAP Theorem — What YOUR Project Trades Off

Every distributed system sacrifices one of: **Consistency, Availability, Partition Tolerance**.

| Your project uses...          | You're choosing... | You accept...                        |
| ----------------------------- | ------------------ | ------------------------------------ |
| PostgreSQL (single)           | CA                 | No partition tolerance (single node) |
| PostgreSQL + replicas (async) | AP                 | Stale reads on replicas              |
| PostgreSQL + replicas (sync)  | CP                 | Higher write latency                 |
| Redis cache + DB              | AP for cache       | Cache may return stale data          |
| Supabase Realtime             | AP                 | Eventual consistency on broadcast    |

**Action:** Check your `docker-compose.yml` and deployment config. Which trade-off are you making?

---

## Replication — When Your Project Needs It

| Signal in YOUR project               | Replication Type             |
| ------------------------------------ | ---------------------------- |
| Read-heavy API, single DB bottleneck | Master-Slave (read replicas) |
| Multi-region deployment needed       | Multi-Master                 |
| analytics queries slowing production | Read replica for analytics   |

**Check:** Does `docker-compose.yml` have `replica` config? If not, you're single-instance.

---

## Sharding — Almost Certainly NOT Yet

**Before sharding, exhaust these options first:**

1. ✅ Add indexes (check with `@[skills/database-design]`)
2. ✅ Optimize queries (N+1, unnecessary JOINs)
3. ✅ Add read replicas
4. ✅ Add caching layer (Redis)
5. ✅ Vertical scale (bigger machine)
6. ❓ THEN consider sharding

**Sharding signals:** DB > 500GB, writes > 10k/sec sustained, vertical scaling maxed.

---

## Indexing Quick Reference (defer to `@[skills/database-design/indexing.md]`)

| Pattern              | Index Type       | Project Check                   |
| -------------------- | ---------------- | ------------------------------- |
| WHERE on FK column   | B-tree           | Every FK MUST be indexed        |
| WHERE on JSONB field | GIN              | Check if you query JSONB        |
| Full-text search     | GIN + tsvector   | Check if you search text        |
| Composite WHERE      | Composite B-tree | Equality cols first, range last |

---

## Anti-Patterns to Audit in Your Codebase

Run `system_design_audit.py` to check, but also:

- [ ] N+1 queries: loop with individual DB calls → use JOIN or batch
- [ ] Missing FK indexes: every `_id` column should be indexed
- [ ] No connection pooling: check if using `pgbouncer` or connection limit
- [ ] Unbounded queries: `SELECT *` without LIMIT → pagination required
- [ ] Storing files in DB: use object storage (S3/R2) instead
