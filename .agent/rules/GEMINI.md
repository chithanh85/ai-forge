---
trigger: always_on
description: Extended rules loaded by GEMINI.md
---

# Repo-Local AI Rules (Extended)

## Agent Routing Table

| Domain        | Agent                   | Skills                                   |
| ------------- | ----------------------- | ---------------------------------------- |
| Backend/API   | `backend-specialist`    | api-patterns, nodejs-best-practices      |
| Frontend/UI   | `frontend-specialist`   | frontend-design, web-design-guidelines   |
| Database      | `database-architect`    | database-design                          |
| DevOps/Deploy | `devops-engineer`       | deployment-procedures, server-management |
| Security      | `security-auditor`      | vulnerability-scanner, red-team-tactics  |
| Testing       | `test-engineer`         | testing-patterns, tdd-workflow           |
| Mobile        | `mobile-developer`      | mobile-design                            |
| Planning      | `project-planner`       | plan-writing, brainstorming              |
| Documentation | `documentation-writer`  | documentation-templates                  |
| Performance   | `performance-optimizer` | performance-profiling                    |
| Debug         | `debugger`              | systematic-debugging                     |
| Orchestration | `orchestrator`          | parallel-agents, intelligent-routing     |

## Workflow Mapping

| Command           | Workflow          | Description                                    |
| ----------------- | ----------------- | ---------------------------------------------- |
| `/brainstorm`     | brainstorm.md     | BA analysis, Socratic questions                |
| `/ba-pipeline`    | ba-pipeline.md    | Full-auto: Use Case → User Story → Plan        |
| `/plan`           | plan.md           | Task breakdown, estimates                      |
| `/design`         | design.md         | DB + API + architecture design                 |
| `/code`           | code.md           | TDD + Self-Healing implementation              |
| `/test`           | test.md           | Test generation and execution                  |
| `/deploy`         | deploy.md         | Staging/production deployment                  |
| `/debug`          | debug.md          | Systematic 4-step debugging                    |
| `/fix-issues`     | fix-issues.md     | Fetch GitHub Issues → fix local → push PR      |
| `/setup-services` | setup-services.md | GitHub + Cloudflare + CI/CD one-click          |
| `/setup-teleport` | setup-teleport.md | Telegram AFK reporting bridge setup            |
| `/audit`          | audit.md          | Security Scan & Code Audit (vbs-scan-security) |
| `/clawpatch`      | clawpatch.md      | Proactive AI code review & semantic patching   |

## Self-Healing Loop Config

- Max auto-fix retries: 3
- On failure: Escalate to human
- Never modify: test expectations, AC criteria, migration files
- Always log: lessons learned to Second Brain + docs/wiki/lessons/

## Telegram Reporting

When user says "tele me" / "gửi tele" / "ping me when done":

- Check `../teleport/scripts/send-telegram.mjs` exists
- If yes → activate `@[skills/teleport-bridge]`
- If no → suggest `/setup-teleport`
