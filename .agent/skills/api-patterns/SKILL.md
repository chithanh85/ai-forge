---
name: api-patterns
description: "Use when designing API endpoints, choosing API style, handling auth/errors, or reviewing API contracts. Reads existing routes before advising."
allowed-tools: Read, Write, Edit, Glob, Grep, RunCommand
version: 2.0
priority: HIGH
---

# API Patterns — Contract-First Design

> **An API is a contract. Breaking it breaks trust.**

## When This Skill Activates

| Trigger                     | Example                       |
| --------------------------- | ----------------------------- |
| Designing new API endpoints | "Add user profile API"        |
| Choosing API style          | "REST or GraphQL?"            |
| API error handling          | "How to return errors?"       |
| API versioning needed       | "Breaking change to endpoint" |
| `/design` workflow          | Phase 3: API Design           |

---

## 🔴 MANDATORY: Context Loading

```
1. Find existing routes: grep for 'router\|@Get\|@Post\|app.get\|app.post'
2. Check API style: REST routes? GraphQL schema? tRPC router?
3. Check auth middleware: grep for 'auth\|guard\|middleware\|jwt\|passport'
4. Check existing response format: what does a current endpoint return?
5. Check OpenAPI/Swagger: any existing spec file?
```

> **NEVER design a new endpoint without checking existing patterns first. Consistency > perfection.**

---

## API Style Decision (Project-Aware)

| Your project already uses...  | Decision                                      |
| ----------------------------- | --------------------------------------------- |
| REST routes (`/api/v1/users`) | **Stay REST**, add new endpoints consistently |
| GraphQL schema                | **Stay GraphQL**, extend schema               |
| tRPC router                   | **Stay tRPC**, add new procedures             |
| Nothing yet                   | Check team/client needs → default REST        |

> **Switching API style mid-project requires VERY strong justification. Don't do it for fun.**

---

## Response Format (Standardize Across Project)

```typescript
// ✅ Success response
{
  "data": { ... },
  "meta": { "page": 1, "total": 100 }  // optional, for lists
}

// ✅ Error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [{ "field": "email", "issue": "required" }]
  }
}
```

**Check:** What does your project currently return? Match it, don't invent new format.

---

## Authentication Decision

| Check your .env for... | You're using... | Pattern                                  |
| ---------------------- | --------------- | ---------------------------------------- |
| `SUPABASE_URL`         | Supabase Auth   | JWT from Supabase, validate on backend   |
| `AUTH0_DOMAIN`         | Auth0           | OIDC tokens, middleware validation       |
| `JWT_SECRET`           | Custom JWT      | Guard middleware, refresh token rotation |
| `SESSION_SECRET`       | Session-based   | Cookie + Redis session store             |

---

## Endpoint Design Checklist

For every new endpoint:

- [ ] Follows existing naming convention (check other routes!)
- [ ] Has input validation (Zod/Joi/class-validator)
- [ ] Has proper HTTP status codes (201 for create, 404 for not found)
- [ ] Has auth guard if needed
- [ ] Has rate limiting if public-facing
- [ ] Has OpenAPI/Swagger documentation
- [ ] Has error handling (try/catch, proper error response)
- [ ] Pagination for list endpoints (never unbounded)

---

## 🔗 Cross-References

| Topic                       | Skill                                    |
| --------------------------- | ---------------------------------------- |
| Auth security               | `@[skills/vulnerability-scanner]`        |
| Rate limiting               | `@[skills/system-design/reliability.md]` |
| Database queries behind API | `@[skills/database-design]`              |
| API performance             | `@[skills/performance-profiling]`        |
| API testing                 | `@[skills/testing-patterns]`             |

---

## Verification

```bash
python .agent/skills/api-patterns/scripts/api_validator.py .
```

Checks: consistent response format, missing validation, unbounded queries, missing auth.

---

## Anti-Patterns

| ❌ Don't                                | ✅ Do                               |
| --------------------------------------- | ----------------------------------- |
| Mixed response formats across endpoints | Standardize one format project-wide |
| `200 OK` for errors                     | Proper HTTP status codes            |
| Sensitive data in URL params            | Use request body or headers         |
| Unbounded list endpoints                | Always paginate                     |
| Breaking changes without versioning     | `/api/v2/` or header versioning     |
| Business logic in controller            | Controller → Service → Repository   |
