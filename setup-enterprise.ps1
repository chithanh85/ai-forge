#!/usr/bin/env pwsh
# ============================================================
# 🏗️ AI Forge Template — Setup Script
# ============================================================
# Usage: .\setup-enterprise.ps1 [-ProjectName "my-app"] [-SkipGit] [-SkipDeps] [-SkipBrain] [-SkipGitNexus]
# ============================================================

param(
    [string]$ProjectName = "",
    [switch]$SkipGit,
    [switch]$SkipDeps,
    [switch]$SkipBrain,
    [switch]$SkipGitNexus,
    [switch]$SkipCodebaseMemory,
    [switch]$NonInteractive
)

$ErrorActionPreference = "Stop"
$script:StepCount = 0

function Write-Step {
    param([string]$Message)
    $script:StepCount++
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "  [$($script:StepCount)] $Message" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
}

function Write-OK { param([string]$Msg) Write-Host "  ✅ $Msg" -ForegroundColor Green }
function Write-Warn { param([string]$Msg) Write-Host "  ⚠️  $Msg" -ForegroundColor Yellow }
function Write-Err { param([string]$Msg) Write-Host "  ❌ $Msg" -ForegroundColor Red }

# ── BANNER ──────────────────────────────────────────────────
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "  ║     🏗️  AI Forge Template Installer              ║" -ForegroundColor Magenta
Write-Host "  ║         Full Autonomy · AI-First · Free          ║" -ForegroundColor Magenta
Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# ── STEP 1: Project Name ───────────────────────────────────
Write-Step "Project Configuration"

if (-not $ProjectName) {
    $ProjectName = Read-Host "  📝 Enter project name (e.g., my-saas-app)"
}
if (-not $ProjectName) {
    Write-Err "Project name is required."
    exit 1
}

$SafeName = $ProjectName -replace '[^a-zA-Z0-9\-_]', '-'
Write-OK "Project: $SafeName"

# Replace placeholder in package.json
$pkgJson = Get-Content "package.json" -Raw
$pkgJson = $pkgJson -replace '"ai-forge"', "`"$SafeName`""
Set-Content "package.json" -Value $pkgJson -NoNewline
Write-OK "package.json updated"

# ── STEP 2: Environment Setup ─────────────────────────────
Write-Step "Environment Configuration"

$envFiles = @(
    @{ src = "envs/.env.example";            dst = ".env" },
    @{ src = "envs/.env.local.example";      dst = ".env.local" },
    @{ src = "envs/.env.test.example";       dst = ".env.test" }
)

foreach ($ef in $envFiles) {
    if (Test-Path $ef.src) {
        if (-not (Test-Path $ef.dst)) {
            Copy-Item $ef.src $ef.dst
            Write-OK "Created $($ef.dst) from $($ef.src)"
        } else {
            Write-Warn "$($ef.dst) already exists, skipping"
        }
    }
}

# ── STEP 3: Credentials Vault ─────────────────────────────
Write-Step "Credentials Vault Setup"

$credSrc = "credentials/credentials.example.toml"
$credDst = "credentials/credentials.toml"

if (Test-Path $credSrc) {
    if (-not (Test-Path $credDst)) {
        Copy-Item $credSrc $credDst
        Write-OK "Created credentials.toml — FILL IN YOUR API KEYS"
        Write-Warn "Open credentials/credentials.toml and add your keys"
    } else {
        Write-Warn "credentials.toml already exists, skipping"
    }
}

$teleSrc = "credentials/telegram.env.example"
$teleDst = "credentials/telegram.env"

if (Test-Path $teleSrc) {
    if (-not (Test-Path $teleDst)) {
        Copy-Item $teleSrc $teleDst
        Write-OK "Created telegram.env — For Teleport Bridge"
    } else {
        Write-Warn "telegram.env already exists, skipping"
    }
}

# ── STEP 4: SSH Config ────────────────────────────────────
Write-Step "SSH Configuration"

$sshSrc = "credentials/ssh-config.example"
$sshDst = "$env:USERPROFILE\.ssh\config"

if (-not $NonInteractive) {
    $setupSSH = Read-Host "  🔑 Setup SSH config? (y/N)"
    if ($setupSSH -eq "y") {
        if (-not (Test-Path $sshDst)) {
            Copy-Item $sshSrc $sshDst
            Write-OK "SSH config created at $sshDst"
            Write-Warn "Edit $sshDst with your server IPs"
        } else {
            Write-Warn "SSH config already exists at $sshDst"
        }
    }
} else {
    Write-Warn "Skipping SSH config (non-interactive mode)"
}

# ── STEP 5: Git Init ──────────────────────────────────────
Write-Step "Git Repository"

if (-not $SkipGit) {
    if (-not (Test-Path ".git")) {
        git init
        git add .
        git commit -m "chore: init from AI Forge Template"
        Write-OK "Git repository initialized with initial commit"
    } else {
        Write-Warn "Git already initialized"
    }
} else {
    Write-Warn "Skipping Git init (--SkipGit)"
}

# ── STEP 6: Install Dependencies ──────────────────────────
Write-Step "Dependencies"

if (-not $SkipDeps) {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm install
        Write-OK "Dependencies installed via pnpm"
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install
        Write-OK "Dependencies installed via npm"
    } else {
        Write-Err "No package manager found. Install Node.js first."
    }
} else {
    Write-Warn "Skipping dependency install (--SkipDeps)"
}

# ── STEP 7: Husky Setup ───────────────────────────────────
Write-Step "Git Hooks (Husky)"

if (-not $SkipDeps -and -not $SkipGit) {
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        npx husky install 2>$null
        Write-OK "Husky git hooks installed"
    }
} else {
    Write-Warn "Skipping Husky (requires Git + deps)"
}

# ── STEP 8: Second Brain ──────────────────────────────────
Write-Step "Second Brain (AI Memory Layer)"

if (-not $SkipBrain) {
    if (-not $NonInteractive) {
        Write-Host ""
        Write-Host "  🧠 Second Brain provides persistent AI memory across sessions." -ForegroundColor White
        Write-Host "     It runs FREE on Cloudflare Workers." -ForegroundColor White
        Write-Host ""
        $hasBrain = Read-Host "  Do you already have a Second Brain deployed? (y/N)"

        if ($hasBrain -eq "y") {
            $brainUrl = Read-Host "  🌐 Second Brain URL (e.g., https://second-brain.xxx.workers.dev)"
            $brainToken = Read-Host "  🔑 Auth Token"

            # Update credentials.toml
            if (Test-Path $credDst) {
                $cred = Get-Content $credDst -Raw
                $cred = $cred -replace 'url = ""(\s+# VD: https://second-brain)', "url = `"$brainUrl`"`$1"
                $cred = $cred -replace 'auth_token = ""(\s+# Token)', "auth_token = `"$brainToken`"`$1"
                Set-Content $credDst -Value $cred -NoNewline
                Write-OK "Second Brain configured in credentials.toml"
            }
        } else {
            Write-Host ""
            Write-Host "  📖 To deploy Second Brain (free):" -ForegroundColor Yellow
            Write-Host "     1. git clone https://github.com/chithanh85/second-brain-cloudflare.git" -ForegroundColor White
            Write-Host "     2. cd second-brain-cloudflare && npm install" -ForegroundColor White
            Write-Host "     3. npx wrangler login" -ForegroundColor White
            Write-Host "     4. npm run db:create  (copy database_id to wrangler.toml)" -ForegroundColor White
            Write-Host "     5. npm run vectors:create" -ForegroundColor White
            Write-Host "     6. npm run db:migrate:remote" -ForegroundColor White
            Write-Host "     7. npm run deploy" -ForegroundColor White
            Write-Host ""
            Write-Warn "Run this script again after deploying Second Brain"
        }
    }
} else {
    Write-Warn "Skipping Second Brain setup (--SkipBrain)"
}

# ── STEP 9: GitNexus (Code Intelligence) ──────────────────
Write-Step "GitNexus — Code Intelligence Engine (MCP)"

if (-not $SkipGitNexus) {
    Write-Host ""
    Write-Host "  🧠 GitNexus biến codebase thành knowledge graph." -ForegroundColor White
    Write-Host "     AI sẽ hiểu cấu trúc code, dependency, call chain thực tế." -ForegroundColor White
    Write-Host "     Hoàn toàn MIỄN PHÍ và chạy local." -ForegroundColor White
    Write-Host ""

    # Check if gitnexus is installed
    $hasGitNexus = Get-Command gitnexus -ErrorAction SilentlyContinue

    if (-not $hasGitNexus) {
        if (-not $NonInteractive) {
            $installGN = Read-Host "  📦 Cài đặt GitNexus? (Y/n)"
            if ($installGN -ne "n") {
                Write-Host "  ⏳ Đang cài gitnexus global..." -ForegroundColor Gray
                npm install -g gitnexus 2>&1 | Out-Null
                $hasGitNexus = Get-Command gitnexus -ErrorAction SilentlyContinue
                if ($hasGitNexus) {
                    Write-OK "GitNexus installed globally"
                } else {
                    Write-Warn "GitNexus install failed — bạn có thể cài sau: npm install -g gitnexus"
                }
            }
        } else {
            Write-Host "  ⏳ Đang cài gitnexus global..." -ForegroundColor Gray
            npm install -g gitnexus 2>&1 | Out-Null
            $hasGitNexus = Get-Command gitnexus -ErrorAction SilentlyContinue
            if ($hasGitNexus) { Write-OK "GitNexus installed globally" }
            else { Write-Warn "GitNexus install failed" }
        }
    } else {
        Write-OK "GitNexus already installed"
    }

    if ($hasGitNexus) {
        # Index codebase
        Write-Host "  ⏳ Indexing codebase..." -ForegroundColor Gray
        gitnexus analyze --skip-embeddings 2>&1 | Out-Null
        Write-OK "Codebase indexed into knowledge graph"

        # Configure MCP for Antigravity/Cursor (.mcp.json)
        $mcpJson = ".mcp.json"
        if (-not (Test-Path $mcpJson) -or ((Get-Content $mcpJson -Raw) -notmatch 'gitnexus')) {
            $mcpContent = @'
{
  "mcpServers": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
'@
            Set-Content $mcpJson -Value $mcpContent
            Write-OK "MCP configured for Antigravity/Cursor (.mcp.json)"
        } else {
            Write-Warn ".mcp.json already has gitnexus config"
        }

        # Configure MCP for Codex (.codex/config.toml)
        $codexConfig = ".codex/config.toml"
        if (Test-Path $codexConfig) {
            $codexContent = Get-Content $codexConfig -Raw
            if ($codexContent -notmatch 'gitnexus') {
                $gitNexusToml = @"

[mcp_servers.gitnexus]
command = "npx"
args = ["-y", "gitnexus@latest", "mcp"]
"@
                Add-Content $codexConfig -Value $gitNexusToml
                Write-OK "MCP configured for Codex CLI (.codex/config.toml)"
            } else {
                Write-Warn ".codex/config.toml already has gitnexus config"
            }
        }

        # Auto-setup for editors (gitnexus setup)
        Write-Host "  ⏳ Auto-configuring MCP for detected editors..." -ForegroundColor Gray
        gitnexus setup 2>&1 | Out-Null
        Write-OK "GitNexus MCP auto-configured for detected editors"
    }
} else {
    Write-Warn "Skipping GitNexus setup (--SkipGitNexus)"
}

# ── STEP 9.5: Codebase-Memory MCP ──────────────────────────
Write-Step "Codebase-Memory MCP (Exploration Engine)"

if (-not $SkipCodebaseMemory) {
    Write-Host ""
    Write-Host "  🔍 Codebase-Memory MCP giúp AI search semantic siêu tốc và trích xuất kiến trúc." -ForegroundColor White
    Write-Host "     Hoàn toàn MIỄN PHÍ, chạy local, tự động config cho các Editor/AI CLI." -ForegroundColor White
    Write-Host ""

    if (-not $NonInteractive) {
        $installCBM = Read-Host "  📦 Cài đặt Codebase-Memory MCP? (Y/n)"
    } else {
        $installCBM = "y"
    }

    if ($installCBM -ne "n") {
        Write-Host "  ⏳ Đang tải và cài đặt codebase-memory-mcp..." -ForegroundColor Gray
        try {
            Invoke-WebRequest -Uri https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.ps1 -OutFile install-cbm.ps1
            Unblock-File .\install-cbm.ps1
            .\install-cbm.ps1 | Out-Null
            Remove-Item .\install-cbm.ps1
            Write-OK "Codebase-Memory MCP installed and auto-configured"
        } catch {
            Write-Err "Failed to install codebase-memory-mcp. $_"
        }
    } else {
        Write-Warn "Skipped codebase-memory-mcp installation"
    }
} else {
    Write-Warn "Skipping Codebase-Memory MCP (--SkipCodebaseMemory)"
}

# ── STEP 10: Validate ────────────────────────────────────
Write-Step "Validation"

$checks = @(
    @{ name = ".env exists";           ok = (Test-Path ".env") },
    @{ name = ".gitignore exists";     ok = (Test-Path ".gitignore") },
    @{ name = "credentials.toml";     ok = (Test-Path "credentials/credentials.toml") },
    @{ name = "GEMINI.md exists";      ok = (Test-Path "GEMINI.md") },
    @{ name = "CLAUDE.md exists";      ok = (Test-Path "CLAUDE.md") },
    @{ name = "AGENTS.md exists";      ok = (Test-Path "AGENTS.md") },
    @{ name = "package.json valid";    ok = (Test-Path "package.json") },
    @{ name = ".mcp.json (GitNexus)";  ok = (Test-Path ".mcp.json") },
    @{ name = "orchestrator.md";       ok = (Test-Path ".agent/agents/orchestrator.md") }
)

$passed = 0
foreach ($c in $checks) {
    if ($c.ok) { Write-OK $c.name; $passed++ }
    else { Write-Err $c.name }
}

Write-Host ""
Write-Host "  Result: $passed/$($checks.Count) checks passed" -ForegroundColor $(if ($passed -eq $checks.Count) { "Green" } else { "Yellow" })

# ── DONE ──────────────────────────────────────────────────
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║          ✅ Setup Complete!                      ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  📋 Next Steps:" -ForegroundColor White
Write-Host "     1. Fill in credentials/credentials.toml" -ForegroundColor Gray
Write-Host "     2. Edit .env with your project settings" -ForegroundColor Gray
Write-Host "     3. Open in VS Code: code ." -ForegroundColor Gray
Write-Host "     4. Start with: /brainstorm or /ba-pipeline" -ForegroundColor Gray
Write-Host "     5. (Optional) Run 'gitnexus analyze' after major code changes" -ForegroundColor Gray
Write-Host ""
