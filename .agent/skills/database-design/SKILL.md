---
name: database-design
description: "Use when creating/modifying database schemas, migrations, indexes, or making ORM decisions. Scans actual schema files before advising."
allowed-tools: Read, Write, Edit, Glob, Grep, RunCommand
version: 2.0
priority: HIGH
---

# Database Design — Schema Guardian

> **Every table you create today, you maintain forever. Get it right the first time.**

## When This Skill Activates

| Trigger                        | Example                            |
| ------------------------------ | ---------------------------------- |
| Creating new database table    | "Add a payments table"             |
| Modifying schema               | "Add user preferences column"      |
| Performance issue with queries | "This query is slow"               |
| Migration creation             | "Create migration for new feature" |
| `/design` workflow             | Phase 2: Database Design           |

---

## 🔴 MANDATORY: Context Loading

```
1. Find schema files: prisma/schema.prisma OR database/migrations/ OR *.sql
2. Check ORM: grep for 'prisma', 'typeorm', 'drizzle', 'knex', 'sequelize'
3. Check DB type: docker-compose.yml → postgres, mysql, mongodb?
4. Check existing conventions: naming patterns, PK types already in use
5. recall() past database incidents or migration issues
```

> **NEVER design a table without knowing what's already in the schema.**

---

## Mandatory Schema Standards

### Primary Keys

```sql
-- ✅ ALWAYS: UUID or ULID
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- ❌ NEVER: auto-increment integer for public-facing IDs
id SERIAL PRIMARY KEY  -- Only for internal join tables
```

### Timestamps

```sql
-- ✅ ALWAYS: Both timestamps, TIMESTAMPTZ
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- ❌ NEVER: TIMESTAMP without timezone, or missing updated_at
```

### Foreign Keys

```sql
-- ✅ ALWAYS: Index every FK column
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- ❌ NEVER: FK without index (causes slow JOINs and deletes)
```

### Naming

| Element     | Convention                       | Example               |
| ----------- | -------------------------------- | --------------------- |
| Tables      | snake_case, plural               | `user_profiles`       |
| Columns     | snake_case                       | `first_name`          |
| FKs         | `{referenced_table_singular}_id` | `user_id`             |
| Indexes     | `idx_{table}_{columns}`          | `idx_orders_user_id`  |
| Constraints | `{table}_{type}_{columns}`       | `orders_check_amount` |

---

## N+1 Prevention Gate

**Before approving any data access pattern:**

```
❌ N+1 Pattern (BANNED):
for user in users:
    orders = db.query("SELECT * FROM orders WHERE user_id = ?", user.id)

✅ Batch Pattern:
users_with_orders = db.query("""
  SELECT u.*, o.* FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  WHERE u.id IN (?, ?, ?)
""", user_ids)
```

**Check your codebase:**

```bash
# Find potential N+1: loops containing DB queries
grep -rn "for.*\n.*\.find\|\.query\|\.select" src/ --include='*.ts'
```

---

## 🔗 Cross-References

| Decision                     | Defer To                               |
| ---------------------------- | -------------------------------------- |
| Index strategy details       | `indexing.md` (this skill)             |
| Migration best practices     | `migrations.md` (this skill)           |
| Query optimization           | `optimization.md` (this skill)         |
| ORM selection                | `orm-selection.md` (this skill)        |
| System-level DB architecture | `@[skills/system-design/databases.md]` |

---

## Verification

```bash
python .agent/skills/database-design/scripts/schema_validator.py .
```

Checks: UUID PKs, TIMESTAMPTZ, FK indexes, naming conventions, N+1 patterns.

---

## Migration Checklist

Before creating any migration:

- [ ] Backward compatible? (can old code still run?)
- [ ] Has rollback (down migration)?
- [ ] Indexes added for new FKs?
- [ ] Default values for new NOT NULL columns?
- [ ] Data migration separate from schema migration?
- [ ] Tested on copy of production data size?

---

## Anti-Patterns

| ❌ Don't                        | ✅ Do                                           |
| ------------------------------- | ----------------------------------------------- |
| Auto-increment PK for entities  | UUID/ULID                                       |
| `TIMESTAMP` without timezone    | `TIMESTAMPTZ`                                   |
| FK column without index         | Always index FKs                                |
| `SELECT *` in production code   | Select only needed columns                      |
| Store files in BYTEA/BLOB       | Use object storage (S3/R2)                      |
| Nullable everything             | Default NOT NULL, nullable only when meaningful |
| JSON column for relational data | Proper normalized tables                        |
