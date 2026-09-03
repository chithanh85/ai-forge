<#
.SYNOPSIS
    Installs and configures the Rune Skill Mesh ecosystem for AI coding assistants.
.DESCRIPTION
    Runs the Rune CLI installation wizard, configures presets (gentle/strict),
    and installs global or project-level hooks to optimize AI agent discipline.
.PARAMETER Preset
    Rune preset selection. Values: gentle (default), strict, off.
.PARAMETER Tier
    Rune tier selection. Values: free (default), pro, business.
.PARAMETER Global
    Configures Rune hooks globally (~/.claude/settings.json) instead of project-level.
.EXAMPLE
    .\setup-rune.ps1 -Preset gentle -Tier free
#>

param (
    [ValidateSet("gentle", "strict", "off")]
    [string]$Preset = "gentle",

    [ValidateSet("free", "pro", "business")]
    [string]$Tier = "free",

    [switch]$Global
)

Write-Host "🔮 Rune Skill Mesh Setup Wizard" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Gray

# Step 1: Check Node.js and npm
Write-Host "🔍 Checking Node.js and npm..." -ForegroundColor Gray
$nodeVer = & node --version 2>$null
$npmVer = & npm --version 2>$null

if ($null -eq $nodeVer -or $null -eq $npmVer) {
    Write-Error "❌ Node.js or npm is not installed. Please install Node.js (v18+) and try again."
    Exit 1
}
Write-Host "   ✅ Node.js: $nodeVer | npm: $npmVer" -ForegroundColor Green

# Step 2: Build installation arguments
$argsList = @("setup", "--here")
$argsList += "--preset", $Preset
$argsList += "--tier", $Tier

if ($Global) {
    $argsList += "--global"
}

Write-Host "🚀 Executing Rune setup with preset: $Preset, tier: $Tier..." -ForegroundColor Cyan

# Step 3: Run npx @rune-kit/rune setup
try {
    # Using npx -y to avoid interactive package installation prompts
    $command = "npx -y @rune-kit/rune@2.32.0 " + ($argsList -join " ")
    Write-Host "   Running: $command" -ForegroundColor Gray
    
    # Run the setup script
    $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c $command" -Wait -NoNewWindow -PassThru
    
    if ($process.ExitCode -ne 0) {
        Write-Host "⚠️ Rune setup exited with code $($process.ExitCode). Please check the outputs above." -ForegroundColor Yellow
    } else {
        Write-Host "🎉 Rune Skill Mesh successfully configured for your AI agents!" -ForegroundColor Green
        Write-Host "   To verify hooks status, run: npx -y @rune-kit/rune@2.32.0 doctor" -ForegroundColor Cyan
    }
}
catch {
    Write-Error "❌ An error occurred during installation: $_"
    Exit 1
}

Write-Host "==================================================" -ForegroundColor Gray
Write-Host "💡 For detail integration rules, please read: docs/wiki/integration/rune.md" -ForegroundColor Cyan
