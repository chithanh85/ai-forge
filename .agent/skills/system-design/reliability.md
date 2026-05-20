# Reliability & Resilience — Project Health Guide

> **Reliability isn't about preventing ALL failures. It's about failing gracefully.**

## 🔴 Before Making Reliability Decisions

```
1. Check deployment config: single server or multi?
2. Check docker-compose.yml: any replicas or failover?
3. Check health endpoints: do services expose /health?
4. Check monitoring: any alerting configured?
```

---

## Availability Target — Choose Yours

| Target            | Downtime/Month | You Need...                 | Cost |
| ----------------- | -------------- | --------------------------- | ---- |
| 99% (2 nines)     | 7.2 hours      | Basic monitoring            | $    |
| 99.9% (3 nines)   | 43.8 min       | Auto-restart, health checks | $$   |
| 99.99% (4 nines)  | 4.3 min        | Multi-AZ, auto-failover     | $$$  |
| 99.999% (5 nines) | 25.9 sec       | Multi-region, active-active | $$$$ |

> **Most startups/projects:** Target 99.9% (3 nines). It's achievable with good ops.

---

## Circuit Breaker — Add to External Calls

**Grep your codebase for these patterns:**

```
grep -r "fetch\|axios\|http\|request" src/ --include='*.ts' --include='*.js'
```

Every external HTTP call should have:

- [ ] Timeout (default 5s, adjust per service)
- [ ] Retry with exponential backoff (3 retries max)
- [ ] Circuit breaker (open after 5 failures, half-open after 30s)
- [ ] Fallback response (cached data, default, or error)

Implementation:

```typescript
// NestJS: use @nestjs/axios with interceptor
// Express: use opossum library
// Node general: use cockatiel
```

---

## Rate Limiting — Protect Your Public APIs

**Check:** Does your project have rate limiting? If not, add it:

- [ ] Per-IP rate limit on auth endpoints (5 req/min)
- [ ] Per-user rate limit on API endpoints (100 req/min)
- [ ] Global rate limit for protection (10k req/min)

Implementation per stack:

- Express: `express-rate-limit` + Redis store
- NestJS: `@nestjs/throttler`
- Nginx: `limit_req_zone`

---

## Health Checks — Every Service Needs One

```typescript
// Minimal health check endpoint
GET /health → { status: 'ok', timestamp: Date.now() }

// Deep health check (for internal monitoring)
GET /health/deep → {
  status: 'ok',
  database: 'connected',
  redis: 'connected',
  uptime: process.uptime(),
  memory: process.memoryUsage()
}
```

**Checklist for your project:**

- [ ] Every service has `/health` endpoint
- [ ] Docker HEALTHCHECK instruction in Dockerfile
- [ ] Load balancer checks `/health` before routing traffic
- [ ] Monitoring alerts on health check failures

---

## Disaster Recovery — Match to Your Budget

| Your situation              | Strategy         | Action                                   |
| --------------------------- | ---------------- | ---------------------------------------- |
| Side project, solo dev      | **Backup daily** | Automated DB dump to S3/R2               |
| Small startup, some revenue | **Pilot Light**  | DB replicas, can spin up app in 30min    |
| Revenue-critical            | **Warm Standby** | Scaled-down copy running, switch in 5min |
| Enterprise, SLA contracts   | **Multi-Site**   | Full redundancy, automatic failover      |

**Minimum for any project:**

- [ ] Database backup (automated, tested restore)
- [ ] Backup stored offsite (different provider/region)
- [ ] Documented restore procedure (tested quarterly)
- [ ] `.env.production` backed up securely

---

## Scalability — Exhaust This List in Order

Before adding complexity, try each step:

1. **Optimize code** (fix N+1 queries, reduce payload)
2. **Add indexes** (check `@[skills/database-design/indexing.md]`)
3. **Add caching** (check `caching.md`)
4. **Vertical scale** (bigger server)
5. **Read replicas** (offload reads)
6. **Horizontal scale** (more app instances + LB)
7. **Sharding** (only if 1-6 aren't enough)

> **Rule:** Never jump to step N without proving step N-1 isn't enough.

---

## Containers vs VMs — For Your Deployment

| Your project                        | Use            | Why                            |
| ----------------------------------- | -------------- | ------------------------------ |
| Microservices, CI/CD pipeline       | **Containers** | Fast, portable, cheap          |
| Legacy app, strong isolation needed | **VMs**        | Full OS, mature tooling        |
| Mixed workloads                     | **Both**       | Containers on VMs (Kubernetes) |
