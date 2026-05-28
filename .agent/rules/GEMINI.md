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

## Contract + Artifact Gate

All non-trivial `/plan`, `/code`, and `/debug` work must use `.agent/artifacts/<run-id>/` and produce these canonical JSON files:

- `context-snippets.json`
- `risk-gate.json`
- `verification.json`
- `review-decision.json`
- `adversarial-validation.json`

`/plan` and `/code` require the five-part contract before implementation: Expected output, Acceptance Criteria, Scope boundary, Non-negotiable constraints, and Touchpoints.

`--fast` may shorten the contract and Scout depth, but it cannot skip planning, risk review, TDD, artifact creation, or checklist validation.

`/debug` requires Scout & Diagnose before root-cause claims or fixes. Capture context/conventions/history/touchpoints in `context-snippets.json`, then reproduction/cause/risk in `risk-gate.json`.

`python .agent/scripts/checklist.py .` auto-discovers `AWF_ARTIFACT_RUN_ID`, `.agent/artifacts/current`, or the latest run directory. It fails closed on missing run directories, missing files, invalid JSON, BLOCK decisions, failed verification/review/adversarial states, or credential-like strings.

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
