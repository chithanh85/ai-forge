# Second Brain Integration Boundary

`second-brain/` in this repository is **documentation for an optional memory capability**. The AWF template does not contain or deploy the remote Second Brain service itself.

## AWF expectation

When a compatible Second Brain integration is available, agents may use it for durable decisions and lessons on non-trivial work. When it is unavailable, core work must continue and may use the local auto-memory fallback under `.agent/skills/auto-memory/` when appropriate.

Remote memory must never be required to understand the current repository; durable project truth still belongs in Git, `.planning/`, `.awf/`, and `docs/`.

## Enable the capability

Platform setup can record the capability:

```powershell
.\setup-enterprise.ps1 -ProjectName my-project -EnableBrain
```

```bash
bash ./setup-enterprise.sh --project-name my-project --enable-brain
```

Or update the manifest explicitly:

```bash
node scripts/awf/configure.mjs --root . --integration second_brain=true
```

Enabling the manifest flag does not deploy a cloud service. Configure a compatible endpoint/credential using the service and client documentation you chose.

## Credential example

If the integration reads `credentials/credentials.toml`, use placeholders such as:

```toml
[second_brain]
url = "https://memory.example.invalid"
auth_token = "replace-locally"
```

`credentials/credentials.toml` is ignored and must not be committed.

## Good memory content

- architecture decisions and rejected alternatives;
- non-obvious bug root causes;
- recurring deployment/environment constraints;
- stable conventions not already better represented in versioned docs.

Do not store secrets, temporary logs, or large copies of source files merely to avoid reading the repository.

## Source of truth

If remote memory disagrees with the current repository, verify the repository and update or retire the stale memory. Second Brain is recall assistance, not authority over Git.
