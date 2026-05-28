# Project State — AI reads this FIRST at every session

## Current Phase

- [x] Template Setup — AI Forge v4.0.2 ready to use
- [ ] Planning — gõ `/brainstorm` hoặc `/ba-pipeline` để bắt đầu
- [ ] Design
- [ ] Implementation
- [ ] Testing
- [ ] Deployment

## Template Status (AI Forge v4.0.2)

This is a **template repo** — the phases above apply to YOUR project built on top of this template.

### What's included & ready:

- ✅ 20 AI agents (orchestrator, frontend, backend, security, devops, BA...)
- ✅ 41 skills (ui-ux-pro-max, teleport-bridge, auto-memory, rico-skills integration...)
- ✅ 12 project workflows (/code, /deploy, /fix-issues, /setup-teleport, /clawpatch...)
- ✅ 4 GitHub Actions (AI PR review, Codex auto-fix, post-merge, pr-check)
- ✅ Clawpatch local proactive review (gitignored local state, `/clawpatch` workflow)
- ✅ GitNexus MCP (.mcp.json configured)
- ✅ Second Brain (local fallback at second-brain/, MCP cloud optional)
- ✅ Teleport Bridge (../teleport/ sibling — run /setup-teleport to configure)
- ✅ Credentials vault (credentials/credentials.example.toml)
- ✅ Pre-commit hooks (Husky + lint-staged)

### Next steps for new project:

1. Run `.\setup-enterprise.ps1 -ProjectName "my-project"`
2. Fill in `credentials/credentials.toml` (copy from example)
3. Run `/setup-teleport` for Telegram AFK reporting
4. Run `/brainstorm` or `/ba-pipeline` to start your project

## Last Session

- **Date:** 2026-05-28
- **What was done:** Implemented advanced ClaudeKit mechanisms: rationalization-prevention rule and schema field, split-plan hydration CLI, parallel plan-review gate with scored reviewers, strict wiki link validation in checklist/pre-commit/PR CI, and regression coverage for each gate. Created `.agent/artifacts/20260528-claudekit-advanced-mechanisms/` evidence.
- **Blockers:** None
- **Next steps:** Use split plan folders (`docs/plans/<slug>/`) with `plan_hydrate.py context`, run `/review-plan` before `/code`, and keep `wiki_lint.py --strict` green.

## Active Tasks

- [x] Implement ClaudeKit guardrails from `docs/plans/claudekit-integration-plan.md`
- [x] Implement advanced ClaudeKit rationalization, hydration, review, and wiki strict gates

## Known Issues

_None._
