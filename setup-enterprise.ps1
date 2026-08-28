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

function Step([string]$Message) { Write-Host "`n== $Message ==" -ForegroundColor Cyan }
function Ok([string]$Message) { Write-Host "  OK: $Message" -ForegroundColor Green }
function Warn([string]$Message) { Write-Host "  WARN: $Message" -ForegroundColor Yellow }

if (-not $ProjectName -and -not $NonInteractive) {
    $ProjectName = Read-Host "Project name"
}
if (-not $ProjectName) { throw "ProjectName is required. Use -ProjectName <name>." }
$SafeName = $ProjectName -replace '[^a-zA-Z0-9_-]', '-'

Step "Project configuration"
$pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
$pkg.name = $SafeName
$pkg | ConvertTo-Json -Depth 20 | Set-Content "package.json" -Encoding utf8
Ok "package.json name = $SafeName"

Step "Project identity"
$projectFile = ".planning/PROJECT.md"
if (Test-Path $projectFile) {
    $text = Get-Content $projectFile -Raw
    $text = $text -replace '_Your project name_', $SafeName
    $text = $text -replace '_One-paragraph description of what this project does\._', '_Describe what this project does._'
    Set-Content $projectFile -Value $text -Encoding utf8
    Ok "Hydrated .planning/PROJECT.md"
}

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
    if (-not (Get-Command gitnexus -ErrorAction SilentlyContinue)) {
        npm install -g gitnexus
    }
    gitnexus analyze --skip-embeddings
    gitnexus setup
    Ok "GitNexus configured"
} else {
    Warn "GitNexus not enabled; use -EnableGitNexus to opt in."
}
if ($EnableCodebaseMemory) {
    Warn "Codebase-Memory installer is remote code. Review/pin its release before enabling it."
    if (-not $NonInteractive) {
        $answer = Read-Host "Install Codebase-Memory now? (y/N)"
        if ($answer -eq "y") {
            Invoke-WebRequest -Uri "https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.ps1" -OutFile "install-cbm.ps1"
            Unblock-File ".\install-cbm.ps1"
            & ".\install-cbm.ps1"
            Remove-Item ".\install-cbm.ps1" -Force
        }
    }
}

Step "Dependencies"
if (-not $SkipDeps) {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "npm is required." }
    npm ci
    Ok "npm ci completed from package-lock.json"
} else { Warn "Dependency installation skipped." }

Step "Git hooks"
if (-not $SkipDeps -and -not $SkipGit -and (Get-Command npx -ErrorAction SilentlyContinue)) {
    npx husky install 2>$null
}

Step "Validation"
npm run lint:check
npm run typecheck
npm test
python .agent/scripts/wiki_lint.py --strict
python .agent/scripts/checklist.py .
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
