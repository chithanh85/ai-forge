# Rune Skill Mesh Integration

Rune is an **optional external integration**. AWF core does not require it and does not rely on Rune-specific model mappings for correctness.

## Pinned setup

The repository provides a PowerShell helper pinned to the currently reviewed package version:

```powershell
.\scripts\maintenance\setup-rune.ps1
```

Current script pin: `@rune-kit/rune@2.32.0`.

Examples:

```powershell
.\scripts\maintenance\setup-rune.ps1 -Preset gentle -Tier free
.\scripts\maintenance\setup-rune.ps1 -Preset strict -Tier pro
.\scripts\maintenance\setup-rune.ps1 -Preset off
```

`-Global` allows Rune to modify global client configuration. Use it only when you intentionally want cross-project changes.

## Trust boundary

Rune can install/configure hooks and may edit client/project configuration. Before enabling it:

1. review the pinned package/upstream behavior;
2. commit or otherwise preserve a clean baseline;
3. run setup;
4. inspect the resulting diff/config changes;
5. run the project's normal verification;
6. disable/remove it if it conflicts with client-native safety or AWF policy.

## Relationship to AWF

Rune hooks may add preflight or helper behavior around an agent session. They do not replace:

- `.awf/policy/core.md`;
- `.awf/manifest.json` command resolution;
- project tests;
- artifact/risk/review gates;
- client sandbox/approval behavior.

## Model routing

AWF intentionally does not publish or maintain a table that maps abstract Rune roles to concrete vendor models. Model names and availability change independently of AWF. The active client, Rune configuration, router or user owns that mapping.

## Doctor

Use the same pinned version when invoking Rune maintenance commands manually:

```bash
npx -y @rune-kit/rune@2.32.0 doctor
```

Then run AWF Doctor separately:

```bash
node scripts/awf/doctor.mjs --root .
```

The two tools check different contracts.
