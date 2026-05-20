#!/usr/bin/env bash
# ============================================================
# Install GitHub Actions Self-hosted Runner on Production Server
# ============================================================
# Usage: bash scripts/deploy/install-github-runner.sh \
#   --repo owner/repo --name my-runner --host production
# ============================================================

set -euo pipefail

REPO=""
RUNNER_NAME="prod-runner"
RUNNER_LABELS="self-hosted,production"
RUNNER_VERSION="2.334.0"
RUNNER_ROOT="/opt/actions-runner"
RUNNER_USER="github-runner"

usage() {
  echo "Usage: $0 --repo OWNER/REPO [--name NAME] [--labels LABELS]"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --repo) REPO="$2"; shift 2 ;;
    --name) RUNNER_NAME="$2"; shift 2 ;;
    --labels) RUNNER_LABELS="$2"; shift 2 ;;
    --version) RUNNER_VERSION="$2"; shift 2 ;;
    *) usage ;;
  esac
done

[[ -z "$REPO" ]] && usage

echo "🏗️  Installing GitHub Actions Runner"
echo "   Repo: $REPO"
echo "   Name: $RUNNER_NAME"
echo "   Labels: $RUNNER_LABELS"

# Create runner user
if ! id -u "$RUNNER_USER" >/dev/null 2>&1; then
  sudo useradd --system --create-home --shell /bin/bash "$RUNNER_USER"
  echo "✅ Created user: $RUNNER_USER"
fi

# Download runner
RUNNER_DIR="${RUNNER_ROOT}/${RUNNER_NAME}"
sudo mkdir -p "$RUNNER_DIR"

cd "$RUNNER_DIR"
ARCHIVE="actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
curl -fsSL "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${ARCHIVE}" -o "$ARCHIVE"
sudo tar xzf "$ARCHIVE"
sudo rm -f "$ARCHIVE"
sudo chown -R "${RUNNER_USER}:${RUNNER_USER}" "$RUNNER_DIR"

# Get registration token (requires gh CLI)
if ! command -v gh &>/dev/null; then
  echo "❌ GitHub CLI (gh) required. Install: https://cli.github.com"
  exit 1
fi

TOKEN=$(gh api -X POST "repos/${REPO}/actions/runners/registration-token" --jq ".token")

# Configure runner
sudo -u "$RUNNER_USER" ./config.sh \
  --url "https://github.com/${REPO}" \
  --token "$TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "$RUNNER_LABELS" \
  --work "_work" \
  --replace \
  --unattended

# Install as systemd service
sudo ./svc.sh install "$RUNNER_USER"
sudo ./svc.sh start
sudo ./svc.sh status || true

echo ""
echo "✅ Runner installed and running!"
echo "   Check: https://github.com/${REPO}/settings/actions/runners"
