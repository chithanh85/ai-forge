---
name: deployment-procedures
description: "Use when deploying, setting up CI/CD, configuring Docker, or managing releases. Reads deployment config before advising."
allowed-tools: Read, Write, Edit, Glob, Grep, RunCommand
version: 2.0
priority: HIGH
---

# Deployment Procedures — Safe Shipping

> **If it's not automated, it's not reliable. If it's not tested, it's not ready.**

## When This Skill Activates

| Trigger                | Example                            |
| ---------------------- | ---------------------------------- |
| First deployment setup | "Configure CI/CD for this project" |
| New environment needed | "Add staging environment"          |
| Docker configuration   | "Create Dockerfile"                |
| Release management     | "Deploy to production"             |
| `/deploy` workflow     | Deployment execution               |

---

## 🔴 MANDATORY: Context Loading

```
1. Check existing CI: .github/workflows/ — what's already configured?
2. Check Docker: Dockerfile, docker-compose.yml — what's containerized?
3. Check package.json scripts: "build", "start", "dev", "deploy"
4. Check env files: envs/.env.production.example — what's needed?
5. Check deployment history: git tag -l — any release tags?
```

---

## Deployment Maturity Levels

| Level | Your project                 | Action                        |
| ----- | ---------------------------- | ----------------------------- |
| 0     | Manual `ssh + git pull`      | Automate with CI/CD           |
| 1     | CI runs tests on PR          | Add CD (auto-deploy on merge) |
| 2     | Auto-deploy to staging       | Add production deploy gate    |
| 3     | Full CI/CD + monitoring      | Add canary/blue-green         |
| 4     | Multi-region + auto-rollback | Enterprise grade              |

> **Target Level 2 minimum.** Self-hosted runner = $0/month CI/CD.

---

## Pre-Deploy Checklist

**Run before EVERY production deployment:**

```bash
# 1. All tests pass
pnpm test

# 2. Security scan
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .

# 3. Env parity check
python scripts/maintenance/env_parity_check.py

# 4. Build succeeds
pnpm build

# 5. No uncommitted changes
git status --porcelain
```

---

## Docker Best Practices

Check your Dockerfile:

- [ ] Multi-stage build (builder → runtime)
- [ ] Non-root user in runtime stage
- [ ] `.dockerignore` excludes node_modules, .git, .env
- [ ] HEALTHCHECK instruction present
- [ ] Specific base image version (not `latest`)
- [ ] Layer ordering: deps first, code last (cache optimization)

---

## Rollback Strategy

| Deployment method  | Rollback                                                        |
| ------------------ | --------------------------------------------------------------- |
| Docker             | `docker-compose up -d --force-recreate` with previous image tag |
| Git-based deploy   | `git revert HEAD && git push`                                   |
| Container registry | Redeploy previous image tag                                     |

**Every deployment MUST have a tested rollback path.**

---

## 🔗 Cross-References

| Topic                | Skill                                    |
| -------------------- | ---------------------------------------- |
| Server management    | `@[skills/server-management]`            |
| Security pre-deploy  | `@[skills/vulnerability-scanner]`        |
| System architecture  | `@[skills/system-design/reliability.md]` |
| Performance baseline | `@[skills/performance-profiling]`        |

---

## Anti-Patterns

| ❌ Don't                                | ✅ Do                                    |
| --------------------------------------- | ---------------------------------------- |
| Deploy on Friday                        | Deploy Mon-Wed, monitor Thu-Fri          |
| Skip tests before deploy                | Tests are the deploy gate                |
| Manual SSH deploys                      | Automated CI/CD pipeline                 |
| `latest` tag in production              | Specific version tags                    |
| No rollback plan                        | Document and test rollback before deploy |
| Deploy database + code changes together | Database first, code second              |
