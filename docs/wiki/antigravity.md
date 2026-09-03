# Gemini / Antigravity Adapter

AWF integrates with Gemini/Antigravity-family coding environments through a **thin client adapter**, not through a separate fork of AWF policy.

## Entry point

`GEMINI.md` contains an AWF-managed region that tells the client to:

- read `.awf/policy/core.md` before non-trivial work;
- read `.awf/manifest.json` for project commands/configuration;
- consult rationalization-prevention rules before code/completion claims;
- use Gemini/Antigravity-native capabilities when they actually exist;
- avoid inventing unsupported subagent/browser/tool capabilities;
- keep model/provider selection outside AWF core.

Project-specific Gemini instructions can live outside the managed region and are preserved by `scripts/awf/sync.mjs`.

## Sync after AWF policy changes

```bash
node scripts/awf/sync.mjs --root .
```

Repeated sync should not create unexpected diff.

## MCP and code intelligence

The source repository currently includes a pinned GitNexus MCP transport definition in `.mcp.json`. Use it when the active client supports that MCP and when impact analysis materially improves the task.

If it is unavailable, use native repository search, symbols, Git history and tests. GitNexus is not a correctness prerequisite for AWF core.

## Agent/subagent behavior

AWF may recommend planner/implementer/reviewer roles or parallel execution for independent work. Actual subagent spawning is a **client capability**. If the current Antigravity/Gemini environment only supports sequential execution, preserve the same plan/review contract sequentially.

## Model selection

Do not copy concrete model names from old historical docs into shared AWF configuration. The user/client/router owns the model mapping and reasoning level.

## State

`.planning/STATE.md` is project state, not a client-specific scratchpad. Temporary client-generated work belongs in ignored runtime areas such as `.tmp/` when possible.

## Safety

Do not use the adapter to bypass the client's trust, approval or sandbox behavior. A client-specific convenience feature never overrides `.awf/policy/core.md` verification and evidence requirements.
