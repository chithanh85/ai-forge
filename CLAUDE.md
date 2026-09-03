<!-- awf:managed:start -->

# AWF Native Adapter

- Project: **awf-enterprise-template**
- Package manager: **npm**
- MUST read `.awf/policy/core.md` before non-trivial work.
- MUST consult `.agent/rules/rationalization-prevention.md` before code writing or completion claims.
- Resolve quality commands from `.awf/manifest.json`; do not hard-code a package manager.
- Model/provider selection is client/user-owned.
- Optional integrations are capability-detected and must degrade gracefully.
- Use Claude-native tools when available; do not assume Gemini or Codex-specific syntax.

<!-- awf:managed:end -->

# Claude adapter notes

- Use Claude-native tools and permissions actually available in the current environment.
- Do not assume Gemini/Antigravity- or Codex-specific command syntax.
- Project-specific Claude rules may be added below this section.
