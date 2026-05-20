# Messaging & Event-Driven — When Your Project Needs It

> **Don't add a message queue because Netflix uses one. Add it when synchronous calls become a bottleneck.**

## 🔴 Before Adding Messaging to Your Project

```
1. Check docker-compose.yml: any queue/broker already?
2. Check existing code: grep for 'queue', 'event', 'publish', 'subscribe'
3. Ask: is the current synchronous flow ACTUALLY a problem?
4. Measure: what's the longest request in your API? (p99 latency)
```

---

## Do You Actually Need a Message Queue?

| Signal in YOUR project                            | Solution                        |
| ------------------------------------------------- | ------------------------------- |
| API endpoint takes > 5s (email, PDF, video)       | ✅ Queue the heavy work         |
| Service A calls Service B, and B failure breaks A | ✅ Decouple with queue          |
| Need to notify multiple services of one event     | ✅ Pub/Sub pattern              |
| Simple CRUD, everything < 200ms                   | ❌ Don't add queue complexity   |
| "We might need it later"                          | ❌ YAGNI — add when you need it |

---

## Queue vs Pub/Sub — Decision

| Your need                              | Pattern            | Tool                      |
| -------------------------------------- | ------------------ | ------------------------- |
| Task A must be processed by ONE worker | **Queue**          | BullMQ/Redis, SQS         |
| Event must notify MANY consumers       | **Pub/Sub**        | Redis Pub/Sub, Kafka, SNS |
| Both: process + notify                 | **Queue + Events** | BullMQ + Redis Pub/Sub    |

---

## Event-Driven Architecture — Maturity Levels

Match your project's current stage:

| Level | Pattern                  | When Your Project Is...                           |
| ----- | ------------------------ | ------------------------------------------------- |
| 0     | Direct function calls    | Solo dev, simple CRUD                             |
| 1     | In-process event emitter | Need to decouple within one service               |
| 2     | Redis Pub/Sub or BullMQ  | Multiple processes, async tasks                   |
| 3     | Kafka / dedicated broker | Multiple services, high throughput, replay needed |
| 4     | Event Sourcing + CQRS    | Full audit trail, complex domain                  |

> **Most projects should be at Level 1-2.** Level 3-4 only when proven necessary.

---

## Event Sourcing — The "Are You Sure?" Gate

**Before implementing Event Sourcing, answer ALL of these YES:**

- [ ] Business REQUIRES full audit trail of every state change
- [ ] You need temporal queries ("what was state at time X?")
- [ ] Team understands eventual consistency implications
- [ ] You have a plan for event schema evolution
- [ ] Read model (projections) complexity is acceptable

> **If any is NO:** Use regular CRUD + audit log table instead.

---

## CQRS — The "Are You Sure?" Gate

**Before implementing CQRS:**

- [ ] Read and write models are FUNDAMENTALLY different
- [ ] Read-to-write ratio is > 100:1
- [ ] You need to scale reads independently from writes
- [ ] Team can handle eventual consistency between models

> **If any is NO:** Use a single model. Maybe add a read-optimized view later.

---

## Real-time Communication — Project Decision

Check what your project needs:

| Your feature              | Protocol         | Implementation                    |
| ------------------------- | ---------------- | --------------------------------- |
| Chat / live updates       | **WebSocket**    | Socket.io, ws library             |
| Server push, live feeds   | **SSE**          | Native EventSource API            |
| Polling for status checks | **Long Polling** | Simple, reliable, no infra needed |

---

## Implementation Checklist

When adding messaging to your project:

- [ ] Broker/queue added to `docker-compose.yml`
- [ ] Connection URL in `.env.*` files (check parity!)
- [ ] Dead letter queue for failed messages
- [ ] Retry policy with exponential backoff
- [ ] Idempotent consumers (same message processed twice = same result)
- [ ] Health check includes broker connectivity
- [ ] Monitoring: queue depth alerts
