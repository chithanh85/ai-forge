# 🧠 Second Brain v2.0 — Enterprise AI Memory Layer

> Persistent AI memory layer with Knowledge Graph & Multi-hop Recall using Cloudflare Workers (free tier).

## What's New in v2.0

- **🕸️ Memory Graph**: Auto-links related memories (>60% similarity) into a knowledge graph. Supports multi-hop traversal (`hops=1-3`).
- **🛡️ Graceful Degradation**: Automatic fallback to D1 SQL keyword search if Vectorize is unavailable. Endpoint `/health` for monitoring.
- **🎚️ Advanced Recall**: Parameterized recency weighting (`recency_weight`), MMR diversity (`diversity`), and similarity threshold cutoff (`min_score`).
- **⚡ Qwen3-Embedding-0.6B**: 1024 dimensions, 32K context window, 100+ languages (including Vietnamese).

## Quick Deploy (7 steps)

```bash
# 1. Clone
git clone https://github.com/chithanh85/second-brain-cloudflare.git
cd second-brain-cloudflare

# 2. Install dependencies
npm install

# 3. Login to Cloudflare
npx wrangler login

# 4. Create D1 database
npm run db:create
# Copy database_id into wrangler.toml

# 5. Create Vectorize index (1024 dimensions for qwen3-embedding)
npm run vectors:create

# 6. Run database schema migration (includes edges table for Memory Graph)
npm run db:migrate:remote

# 7. Deploy
npm run deploy
```

## Configure in your project

Update `credentials/credentials.toml` or `.mcp.json`:

```toml
[second_brain]
url = "https://second-brain.your-subdomain.workers.dev"
auth_token = "your-secret-token-here"
```

## MCP Tools Available (7 tools)

| Tool          | Parameters                                                                       | Description                                                                  |
| ------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `remember`    | `content`, `tags?`, `source?`                                                    | Store new knowledge (auto dedup >95%, auto-link >60%)                        |
| `recall`      | `query`, `topK?`, `tag?`, `hops?`, `recency_weight?`, `diversity?`, `min_score?` | Semantic search + Multi-hop graph expansion + MMR diversity                  |
| `append`      | `id`, `addition`                                                                 | Append timestamped update to existing entry                                  |
| `list_recent` | `n?`, `tag?`                                                                     | List recent entries ordered by date                                          |
| `forget`      | `id`                                                                             | Delete entry, vector chunks, and graph edges                                 |
| `link`        | `source_id`, `target_id`, `relation?`                                            | Manually link 2 memories (`related`, `extends`, `contradicts`, `depends_on`) |
| `connections` | `id`, `depth?`                                                                   | Inspect connected memories in the knowledge graph                            |

## Cost

**$0/month** on Cloudflare free tier (100k requests/day, 5GB D1, 30M vector dimensions).
