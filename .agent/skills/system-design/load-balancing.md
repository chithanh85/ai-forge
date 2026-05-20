# Load Balancing & Clustering — When Your Project Needs It

> **Single server is fine until it isn't. Know when to add LB, not before.**

## 🔴 Before Adding Load Balancing

```
1. Check deployment: how many instances running? (docker-compose replicas?)
2. Check traffic: is one server actually maxed out?
3. Check Nginx/Traefik config: is a reverse proxy already in place?
4. Ask: is the bottleneck the app, the DB, or the network?
```

---

## Do You Need a Load Balancer?

| Your project                          | LB needed? | What to do instead             |
| ------------------------------------- | ---------- | ------------------------------ |
| Single server, < 1k req/s             | ❌         | Optimize code, add caching     |
| Single server, hitting CPU/RAM limits | ⚠️ Maybe   | Try vertical scaling first     |
| Multiple instances needed for HA      | ✅         | Nginx/Traefik as reverse proxy |
| Multi-region deployment               | ✅         | Cloud LB (AWS ALB, GCP LB)     |

---

## LB Algorithm — Match to Your Traffic

| Your traffic pattern                 | Algorithm             | Config                                      |
| ------------------------------------ | --------------------- | ------------------------------------------- |
| All servers equal                    | **Round Robin**       | `upstream { server a; server b; }`          |
| Servers have different specs         | **Weighted**          | `upstream { server a weight=3; server b; }` |
| Long-lived WebSocket connections     | **Least Connections** | `upstream { least_conn; }`                  |
| Session-dependent (no Redis session) | **IP Hash**           | `upstream { ip_hash; }`                     |

> **Default:** Round Robin. Only change with a measured reason.

---

## Health Check — Non-negotiable

Every LB config MUST include health checks:

```nginx
upstream backend {
    server app1:3000 max_fails=3 fail_timeout=30s;
    server app2:3000 max_fails=3 fail_timeout=30s;
}
```

---

## Clustering vs Load Balancing

| Concept     | Servers know each other? | Use case                   |
| ----------- | ------------------------ | -------------------------- |
| **LB**      | No                       | Stateless app instances    |
| **Cluster** | Yes, share state         | Redis Cluster, DB replicas |

> **Your project likely needs LB, not clustering** (unless you're scaling Redis/DB).

---

## Implementation Checklist

When adding LB to your project:

- [ ] Reverse proxy configured (Nginx/Traefik/Caddy)
- [ ] Health check endpoint on every service
- [ ] Session state moved to external store (Redis)
- [ ] SSL termination at LB level
- [ ] Sticky sessions ONLY if absolutely needed
- [ ] Log real client IP (X-Forwarded-For header)
- [ ] Rate limiting at LB level for DDoS protection
