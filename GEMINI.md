<!-- awf:managed:start -->

# AWF Native Adapter

- Project: **awf-enterprise-template**
- Package manager: **npm**
- MUST read `.awf/policy/core.md` before non-trivial work.
- MUST consult `.agent/rules/rationalization-prevention.md` before code writing or completion claims.
- Resolve quality commands from `.awf/manifest.json`; do not hard-code a package manager.
- Model/provider selection is client/user-owned.
- Optional integrations are capability-detected and must degrade gracefully.
- Use Gemini/Antigravity-native tools when available; do not invent unsupported subagent or browser capabilities.

<!-- awf:managed:end -->

# Gemini / Antigravity adapter notes

- Use the client-native planning, tool, and subagent features actually available in the current environment.
- Do not assume Codex- or Claude-specific command syntax.
- Project-specific Gemini rules may be added below this section.
