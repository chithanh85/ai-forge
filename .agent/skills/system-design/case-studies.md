# Case Studies — Learn Then Apply to YOUR Project

> **Don't copy these designs. Extract principles, then apply to your context.**

## How to Use Case Studies

1. Read the case study that's closest to your feature
2. Extract the relevant pattern
3. Check if pattern fits your project's scale and constraints
4. Adapt (not copy) to your architecture

---

## 1. URL Shortener → **Key Generation Pattern**

**Extract for your project:** When you need unique short IDs.

- Use: invite codes, share links, reference numbers
- Pattern: Base62(snowflake_id) or NanoID
- Storage: Key-value lookup (Redis) + persistent DB

**Apply when your project needs:**

- [ ] Generating unique short codes
- [ ] High-throughput ID generation
- [ ] Read-heavy lookup (cache the mapping)

---

## 2. Chat System → **Real-time + Persistence Pattern**

**Extract for your project:** When you need real-time updates with history.

- Protocol: WebSocket for real-time, REST for history
- Storage: Append-only (time-series optimized)
- Delivery: At-least-once with client-side dedup

**Apply when your project needs:**

- [ ] Live notifications or updates
- [ ] Message history / audit trail
- [ ] Online presence detection
- [ ] Check: are you already using WebSocket? (`grep 'socket' docker-compose.yml`)

---

## 3. Social Feed → **Fan-out Pattern**

**Extract for your project:** When you need personalized feeds.

- Fan-out on write: Pre-compute feed for each follower (fast read, expensive write)
- Fan-out on read: Compute feed on request (cheap write, expensive read)
- Hybrid: Write for normal users, read for power users

**Apply when your project needs:**

- [ ] Personalized content for each user
- [ ] Activity feed or timeline
- [ ] Decision: what's your follower/following ratio?

---

## 4. Streaming → **Large File Processing Pattern**

**Extract for your project:** When you handle large files or media.

- Upload: Chunked upload to object storage (S3/R2)
- Processing: Async job queue (video transcoding, image resize)
- Delivery: CDN edge caching

**Apply when your project needs:**

- [ ] File upload > 10MB
- [ ] Image/video processing
- [ ] Serving static content to global users
- [ ] Check: are you storing files in DB? → Move to object storage

---

## 5. Ride-sharing → **Location + Matching Pattern**

**Extract for your project:** When you need proximity-based features.

- Location indexing: Geohashing or PostGIS
- Real-time tracking: WebSocket with throttled updates (1-5/sec)
- Matching: Score-based with proximity + availability

**Apply when your project needs:**

- [ ] "Find nearest X" queries
- [ ] Real-time position tracking
- [ ] Two-sided marketplace matching

---

## Pattern → Project Mapping

When building a new feature, ask: "Which case study pattern is closest?"

| Your feature  | Closest pattern      | Key takeaway                      |
| ------------- | -------------------- | --------------------------------- |
| Share links   | URL Shortener        | Base62 ID + Redis cache           |
| Notifications | Chat System          | WebSocket + message queue         |
| Activity feed | Social Feed          | Fan-out strategy                  |
| File uploads  | Streaming            | Object storage + async processing |
| Marketplace   | Ride-sharing         | Geohashing + scoring              |
| Search        | Twitter              | Elasticsearch, not SQL LIKE       |
| Payments      | Banking (not listed) | Event sourcing + idempotency      |
