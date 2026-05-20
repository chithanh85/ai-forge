# Caching & CDN — Project Decision Guide

> **Don't add caching because it sounds good. Add it when measurements prove you need it.**
> Related: `@[skills/performance-profiling]` for measurement.

## 🔴 Before Adding Cache to Your Project

```
1. Check docker-compose.yml: is Redis/Memcached already there?
2. Check existing code: grep for 'redis', 'cache', 'ttl'
3. Measure: what's the actual read/write ratio?
4. Ask: is the bottleneck the DB or the network?
```

---

## Cache Strategy Decision — Based on Your Data

| Your data pattern                                  | Strategy               | Implementation                                |
| -------------------------------------------------- | ---------------------- | --------------------------------------------- |
| Read 100x per write, rarely changes                | **Cache-Aside (Lazy)** | App checks cache first, loads from DB on miss |
| Writes must be immediately readable                | **Write-Through**      | Write to cache AND DB simultaneously          |
| High write throughput, reads can be slightly stale | **Write-Back**         | Write to cache, async flush to DB             |
| Static content, global users                       | **CDN**                | Cloudflare/CloudFront edge caching            |

> **Default for most projects:** Cache-Aside + Redis with TTL.

---

## Cache Eviction — Match to Your Use Case

| Your data                     | Policy            | Why                             |
| ----------------------------- | ----------------- | ------------------------------- |
| Recent items matter most      | **LRU** (default) | Removes least recently accessed |
| Frequency matters (hot items) | **LFU**           | Keeps frequently accessed items |
| Data has natural expiry       | **TTL**           | Set expiry per key              |

---

## CDN Decision

| Your project has...                | CDN Type     | Action                          |
| ---------------------------------- | ------------ | ------------------------------- |
| Static JS/CSS/images, global users | **Pull CDN** | Put Cloudflare in front         |
| User-uploaded media                | **Push CDN** | Upload to R2/S3, serve via CDN  |
| API-only, no static content        | **None**     | CDN adds no value for JSON APIs |

---

## What to Cache in Your Project

Grep your codebase for these patterns:

| Pattern Found                      | Cache It?         | How                              |
| ---------------------------------- | ----------------- | -------------------------------- |
| Same DB query in every request     | ✅ Cache result   | Redis, TTL 5-60 min              |
| User session/auth token lookup     | ✅ Cache token    | Redis, TTL = token expiry        |
| External API call (rate-limited)   | ✅ Cache response | Redis, TTL = API freshness       |
| Per-user personalized data         | ⚠️ Maybe          | Only if computation is expensive |
| Real-time data (live prices, chat) | ❌ Don't cache    | Data is stale immediately        |

---

## Implementation Checklist

When adding caching to your project:

- [ ] Redis added to `docker-compose.yml`
- [ ] `REDIS_URL` in all `.env.*` files (check parity!)
- [ ] Cache module/service created (not inline redis calls)
- [ ] TTL set on every cached key (no infinite caches)
- [ ] Cache invalidation on writes (clear related keys)
- [ ] Health check includes Redis connectivity
- [ ] Fallback: if Redis is down, app still works (degraded, not broken)
