# Architecture Patterns — Evolution Guide

> **Architecture is not a one-time decision. It evolves with your project.**

## 🔴 Before Any Architecture Decision

```
1. Read ARCHITECTURE.md — what's the current state?
2. Count team members — patterns must match team capacity
3. Check deployment config — what infra exists?
4. recall() past architecture decisions and incidents
```

---

## Architecture Evolution Path (Follow This Order)

```
Level 0: Single file / script
  ↓ When: you need structure
Level 1: Modular Monolith (folders by feature)
  ↓ When: one module needs different scaling
Level 2: Extract hot service (1 monolith + 1-2 services)
  ↓ When: multiple teams work on different modules
Level 3: Microservices (each domain = service)
  ↓ When: global scale, 50+ engineers
Level 4: Event-driven microservices
```

> **Most projects should stay at Level 1-2.** Level 3+ is for proven scale needs.

### Team Size → Architecture

| Team      | Architecture                      | Why                                  |
| --------- | --------------------------------- | ------------------------------------ |
| 1-3 devs  | Modular Monolith                  | Can't maintain service mesh          |
| 3-8 devs  | Monolith + 1-2 extracted services | Extract only what scales differently |
| 8-20 devs | Service-oriented                  | Teams own services                   |
| 20+ devs  | Microservices                     | Conway's Law applies                 |

---

## API Gateway — Do You Need One?

| Your project has...                              | API Gateway? | Implementation                 |
| ------------------------------------------------ | ------------ | ------------------------------ |
| Single backend, simple routing                   | ❌ No        | Nginx/Traefik as reverse proxy |
| 2-3 services, need unified auth                  | ⚠️ Maybe     | Nginx with auth subrequest     |
| 5+ services, different auth/rate-limit per route | ✅ Yes       | Kong, AWS API GW, custom       |

---

## API Style — Match to Your Project

Check your project's existing API style first, then decide:

| Situation                         | Best Choice | Why                       |
| --------------------------------- | ----------- | ------------------------- |
| Public API, third-party consumers | **REST**    | Universal, well-tooled    |
| Mobile app, complex nested data   | **GraphQL** | Client picks exact fields |
| Internal service-to-service       | **gRPC**    | Fast, typed, streaming    |
| Full-stack TypeScript monorepo    | **tRPC**    | End-to-end type safety    |

> **Default:** REST with OpenAPI spec. Switch only with measured reason.

---

## Monolith → Microservice Migration

**If you're considering splitting a monolith, follow this process:**

1. **Identify the candidate module:**
   - Which module has different scaling needs?
   - Which module changes most frequently?
   - Which module causes most deployment issues?

2. **Verify the boundary is clean:**

   ```
   grep -r "import.*from.*candidate-module" src/
   → If too many cross-imports, the boundary isn't clean yet
   ```

3. **Strangle pattern:**
   - New feature goes to new service
   - Route traffic via proxy (old → new gradually)
   - Old code stays until 100% migrated

4. **Infrastructure needed BEFORE splitting:**
   - [ ] Service discovery (DNS or Consul)
   - [ ] Centralized logging (ELK, Datadog)
   - [ ] Distributed tracing (Jaeger, Zipkin)
   - [ ] Health checks on every service
   - [ ] Circuit breaker on all cross-service calls

---

## Proxy Decision

| Need                            | Type              | Tool           |
| ------------------------------- | ----------------- | -------------- |
| Hide backend from internet      | **Reverse Proxy** | Nginx, Traefik |
| SSL termination                 | **Reverse Proxy** | Nginx, Caddy   |
| Route to multiple backends      | **Reverse Proxy** | Nginx, Traefik |
| Employees access external sites | **Forward Proxy** | Squid          |

---

## Anti-Patterns to Watch For

| ❌ Anti-Pattern                 | Check In Your Project                |
| ------------------------------- | ------------------------------------ |
| Distributed monolith            | Services sharing the same database?  |
| Too many services for team size | More services than developers?       |
| No API versioning               | Breaking changes affect consumers?   |
| Synchronous chain (A→B→C→D)     | Latency compounds, failure cascades? |
| God service                     | One service doing everything?        |
