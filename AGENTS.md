<!-- awf:managed:start -->

# AWF Native Adapter

- Project: **awf-enterprise-template**
- Package manager: **npm**
- MUST read `.awf/policy/core.md` before non-trivial work.
- MUST consult `.agent/rules/rationalization-prevention.md` before code writing or completion claims.
- Resolve quality commands from `.awf/manifest.json`; do not hard-code a package manager.
- Model/provider selection is client/user-owned.
- Optional integrations are capability-detected and must degrade gracefully.
- Use this adapter for Codex and other AGENTS.md-compatible clients.

<!-- awf:managed:end -->

# Project-local rules

Add project-specific rules below this heading. AWF sync preserves content outside the managed region.
