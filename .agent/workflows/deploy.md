---
name: deploy
description: Deployment with safety checks and memory
---

# /deploy — Safe Deployment

## Trigger

User types `/deploy`

## Steps

### Phase 1: Pre-Deploy + Recall

1. **AUTO-RECALL past deploy issues:**
   ```bash
   # MCP:
   mcp_second-brain_recall(query="deploy issues rollback")
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py recall "deploy"
   ```
2. Report: "Past deploy issues found: {summary}" (if any)
3. Ask user: which environment? (staging/production)

### Phase 2: Pre-Deploy Checks

```bash
# All must pass before deploying:
pnpm test                                    # Tests
pnpm lint                                    # Lint
# Security: run /audit (vbs-scan-security) — must PASS or WARN
python scripts/maintenance/env_parity_check.py  # Env parity
pnpm build                                  # Build
```

### Phase 3: Deploy

1. Git tag the release: `git tag v{version}`
2. Push to trigger CI/CD
3. Monitor deployment logs
4. Verify health check after deploy

### Phase 4: Post-Deploy + Remember

1. Verify `/health` endpoint returns OK
2. Quick smoke test on critical paths
3. **AUTO-REMEMBER deploy result:**
   ```bash
   # MCP:
   mcp_second-brain_remember(
     topic="Deployed v{version} to {env}",
     detail="Changes: {summary}. Status: {pass/fail}. Issues: {any}. Rollback: {tested}.",
     tags=["deploy", "{env}", "v{version}"]
   )
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py remember \
     "Deployed v{version} to {env}" \
     "Changes: {summary}. Status: {result}." \
     --tags deploy env --type lesson
   ```
4. Update `.planning/STATE.md`

### Phase 5: Next Steps

- Monitor for 30 minutes
- Check error rates in logging/monitoring
- If issues: `/debug` → `/rollback`

### 📡 Teleport Hook (Auto)

If `../teleport/` exists and user is AFK:

```bash
node ../teleport/scripts/send-telegram.mjs "<emoji> *<Agent> on deploy v{version}:*
✅ Deployed to {env}
✅ Health check passed
✅ Smoke test OK"
```

Then start reply listener per `@[skills/teleport-bridge]`.
