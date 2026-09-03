#!/usr/bin/env pwsh
# AWF Enterprise Template bootstrapper
# Safe defaults: core setup is automatic; optional integrations require explicit enable flags.

[CmdletBinding()]
param(
    [string]$ProjectName = "",
    [switch]$SkipGit,
    [switch]$SkipDeps,
    [switch]$EnableBrain,
    [switch]$EnableGitNexus,
    [switch]$EnableCodebaseMemory,
    [switch]$NonInteractive
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

function Step([string]$Message) { Write-Host "`n== $Message ==" -ForegroundColor Cyan }
function Ok([string]$Message) { Write-Host "  OK: $Message" -ForegroundColor Green }
function Warn([string]$Message) { Write-Host "  WARN: $Message" -ForegroundColor Yellow }

if (-not $ProjectName -and -not $NonInteractive) {
    $ProjectName = Read-Host "Project name"
}
if (-not $ProjectName) { throw "ProjectName is required. Use -ProjectName <name>." }
$SafeName = $ProjectName -replace '[^a-zA-Z0-9_-]', '-'

Step "Native AWF initialization"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js is required." }
if (Get-Command python -ErrorAction SilentlyContinue) {
    $PythonExe = "python"
    $PythonPrefixArgs = @()
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $PythonExe = "py"
    $PythonPrefixArgs = @("-3")
} else {
    throw "Python 3.10+ is required."
}
node scripts/awf/init.mjs --project-name $SafeName --root .
if ($LASTEXITCODE -ne 0) { throw "AWF native initialization failed." }
Ok "Hydrated project identity and .awf/manifest.json"

Step "Environment"
foreach ($item in @(
    @{ Source = "envs/.env.example"; Destination = ".env" },
    @{ Source = "envs/.env.local.example"; Destination = ".env.local" },
    @{ Source = "envs/.env.test.example"; Destination = ".env.test" }
)) {
    if ((Test-Path $item.Source) -and -not (Test-Path $item.Destination)) {
        Copy-Item $item.Source $item.Destination
        Ok "Created $($item.Destination)"
    }
}

Step "Credentials"
if ((Test-Path "credentials/credentials.example.toml") -and -not (Test-Path "credentials/credentials.toml")) {
    Copy-Item "credentials/credentials.example.toml" "credentials/credentials.toml"
    Ok "Created credentials/credentials.toml"
}
if ((Test-Path "credentials/telegram.env.example") -and -not (Test-Path "credentials/telegram.env")) {
    Copy-Item "credentials/telegram.env.example" "credentials/telegram.env"
    Ok "Created credentials/telegram.env"
}

Step "Optional integrations"
if ($EnableBrain) {
    Warn "Second Brain enabled; configure credentials/credentials.toml after deployment."
}
if ($EnableGitNexus) {
    npx -y gitnexus@1.6.10 analyze --skip-embeddings
    if ($LASTEXITCODE -ne 0) { throw "GitNexus analysis failed." }
    npx -y gitnexus@1.6.10 setup
    if ($LASTEXITCODE -ne 0) { throw "GitNexus setup failed." }
    Ok "GitNexus 1.6.10 configured"
} else {
    Warn "GitNexus not enabled; use -EnableGitNexus to opt in."
}
if ($EnableCodebaseMemory) {
    Warn "Codebase-Memory requested. AWF records the capability but will not execute an unpinned remote installer. Configure it explicitly after reviewing its release."
}
$BrainEnabled = if ($EnableBrain) { "true" } else { "false" }
$GitNexusEnabled = if ($EnableGitNexus) { "true" } else { "false" }
$CodebaseMemoryEnabled = if ($EnableCodebaseMemory) { "true" } else { "false" }
node scripts/awf/configure.mjs --root . --integration "second_brain=$BrainEnabled" --integration "gitnexus=$GitNexusEnabled" --integration "codebase_memory=$CodebaseMemoryEnabled"
if ($LASTEXITCODE -ne 0) { throw "AWF integration configuration failed." }

Step "Dependencies"
if (-not $SkipDeps) {
    node scripts/awf/exec.mjs install --root .
    if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed." }
    Ok "Dependencies installed using .awf/manifest.json"
} else { Warn "Dependency installation skipped." }

Step "Validation"
& $PythonExe @PythonPrefixArgs .agent/scripts/checklist.py . --core
if ($LASTEXITCODE -ne 0) { throw "Core verification failed." }
Ok "Core verification passed"

Step "Git initialization"
if (-not $SkipGit) {
    if (-not (Test-Path ".git")) {
        git init
        git add .
        git commit -m "chore: initialize project from AWF template"
        Ok "Initial commit created after setup and validation"
    } else { Warn "Git already initialized; preserving existing repository history." }
} else { Warn "Git initialization skipped." }

Write-Host "`nSetup complete for $SafeName." -ForegroundColor Green
Write-Host "Next: fill credentials and complete .planning/PROJECT.md description and stack."
