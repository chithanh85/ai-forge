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
- **What was done:** Implemented advanced ClaudeKit mechanisms (rationalization rules, hydration, plan-review, wiki strict validation). Evaluated awesome-agent-harness integration candidates. Created docs/plans/harness-integration-plan.md and fully implemented the Session Checkpoint Manager (session_manager.py) and Git Worktree execution runner (worktree_runner.py), including integration in orchestrator guidelines, parallel skills, code/debug workflows, gitignore, and comprehensive Vitest regression suites. Verified codebase is 100% healthy with 6/6 verify checks passed.
- **Blockers:** None
- **Next steps:** Use split plan folders (`docs/plans/<slug>/`) with `plan_hydrate.py context`, run `/review-plan` before `/code`. Leverage checkpoint.json and worktree_runner.py for safe, isolated write operations.

## Active Tasks

- [x] Implement ClaudeKit guardrails from `docs/plans/claudekit-integration-plan.md`
- [x] Implement advanced ClaudeKit rationalization, hydration, review, and wiki strict gates
- [x] Evaluate awesome-agent-harness integration candidates for AWF
- [x] Create harness integration plan for Session Checkpointing and Git Worktree Runner
- [x] Implement harness primitives from `docs/plans/harness-integration-plan.md`

## Known Issues

_None._
