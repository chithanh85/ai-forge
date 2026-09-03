# Optional Integrations

AWF v4.1 distinguishes **core correctness** from **optional capability**. A project should still be usable when optional integrations are unavailable.

## Integration contract

```text
detect -> explicitly enable -> configure -> verify -> use -> degrade gracefully
```

Shared AWF policy must not assume a particular account, model, sibling directory, endpoint, or remote installer exists on another user's machine.

## GitNexus

Purpose: repository graph/code-intelligence support such as impact analysis and navigation.

Current source behavior:

- `.mcp.json` contains a pinned `gitnexus@1.6.10` MCP transport definition.
- `--EnableGitNexus` / `--enable-gitnexus` runs pinned analyze/setup and records `integrations.gitnexus=true`.
- AWF workflows must still degrade to native repository search/analysis when GitNexus is unavailable.

Some clients auto-launch `.mcp.json`; therefore transport availability and AWF workflow opt-in are separate concepts. The manifest boolean says whether AWF should rely on the capability. It is not a universal process supervisor for every client.

## Second Brain

Purpose: optional durable recall across sessions.

AWF does not ship the cloud memory service implementation here. `second-brain/README.md` documents the integration boundary. When unavailable, local auto-memory may be used when appropriate.

Do not block core work because remote memory is offline.

## Codebase Memory

Setup can record `codebase_memory=true`, but AWF deliberately does **not** execute an unpinned remote installer.

If a project wants this capability, review and pin the upstream release, configure it explicitly, verify it independently, then allow workflows to rely on it.

## Rune

Rune is a separate optional hook/skill-mesh integration.

```powershell
.\scripts\maintenance\setup-rune.ps1
```

The script currently pins `@rune-kit/rune@2.32.0`. Rune may modify client hook/configuration files; review its diff and upstream behavior before enabling it globally.

AWF does not maintain a model-name translation table for Rune. Model routing remains the responsibility of Rune/the active client/user configuration.

See [wiki/integration/rune.md](wiki/integration/rune.md).

## Open Design

Open Design is an external design capability, not a core dependency.

AWF no longer instructs users to execute the previously referenced broken/unverified npm MCP package. If a project runs a compatible Open Design daemon/endpoint, configure that endpoint through the relevant client's documented mechanism and verify it before use.

## Clawpatch

Clawpatch is an optional local proactive-review workflow. `.clawpatch/` runtime state is ignored by Git.

Do not treat findings as automatically correct or allow generated patches to skip normal diff review, tests, or approval gates.

## Teleport / remote reporting

Teleport-style reporting is project-specific. Core does not assume a sibling `../teleport` repository, Telegram credentials, or a running bridge.

If enabled, keep reporting credentials in ignored local files and treat remote commands as a separate trust boundary.

## AI coding clients

AWF ships adapters for broad client families, but adapters do not grant capabilities a client does not have.

- `AGENTS.md`: AGENTS-compatible clients such as Codex environments.
- `GEMINI.md`: Gemini/Antigravity-family entrypoint.
- `CLAUDE.md`: Claude-compatible entrypoint.

The client owns actual model availability, subagent support, browser/computer tools, sandbox policy, approvals, rate limits, and authentication.

## Secrets

Keep real values in ignored local files such as:

```text
.env
.env.local
credentials/credentials.toml
credentials/telegram.env
```

Never place a real secret in `.awf/manifest.json`, shared adapters, docs, task artifacts, or committed example files.
