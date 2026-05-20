# Second Brain — Setup Guide

> Persistent AI memory layer using Cloudflare Workers (free tier).

## Quick Deploy (7 steps)

```bash
# 1. Clone
git clone https://github.com/chithanh85/second-brain-cloudflare.git
cd second-brain-cloudflare

# 2. Install
npm install

# 3. Login to Cloudflare
npx wrangler login

# 4. Create D1 database
npm run db:create
# Copy the database_id into wrangler.toml

# 5. Create Vectorize index
npm run vectors:create

# 6. Run migrations
npm run db:migrate:remote

# 7. Deploy
npm run deploy
# Note the URL (e.g., https://second-brain.xxx.workers.dev)
```

## Configure in your project

After deploying, update `credentials/credentials.toml`:

```toml
[second_brain]
url = "https://second-brain.xxx.workers.dev"
auth_token = "your-token-here"
```

## MCP Tools Available

| Tool          | Description                           |
| ------------- | ------------------------------------- |
| `remember`    | Store new knowledge (auto dedup >95%) |
| `recall`      | Semantic search across all memories   |
| `append`      | Update existing entry                 |
| `list_recent` | List recent entries                   |
| `forget`      | Delete outdated entry                 |

## Cost

**$0/month** on Cloudflare free tier (100k requests/day, 5GB D1, 5M vector dimensions).
