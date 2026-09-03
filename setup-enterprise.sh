#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
PROJECT_NAME=""; SKIP_GIT=false; SKIP_DEPS=false; NON_INTERACTIVE=false
ENABLE_BRAIN=false; ENABLE_GITNEXUS=false; ENABLE_CODEBASE_MEMORY=false
usage(){ cat <<'EOF'
Usage: ./setup-enterprise.sh --project-name NAME [options]
  --skip-git --skip-deps --non-interactive
  --enable-brain --enable-gitnexus --enable-codebase-memory
EOF
}
while [[ $# -gt 0 ]]; do case "$1" in
  -p|--project-name) PROJECT_NAME="$2"; shift 2;;
  --skip-git) SKIP_GIT=true; shift;; --skip-deps) SKIP_DEPS=true; shift;;
  --enable-brain) ENABLE_BRAIN=true; shift;; --enable-gitnexus) ENABLE_GITNEXUS=true; shift;;
  --enable-codebase-memory) ENABLE_CODEBASE_MEMORY=true; shift;; --non-interactive) NON_INTERACTIVE=true; shift;;
  -h|--help) usage; exit 0;; *) echo "Unknown option: $1" >&2; usage; exit 2;; esac; done
if [[ -z "$PROJECT_NAME" && "$NON_INTERACTIVE" == false ]]; then read -r -p "Enter project name: " PROJECT_NAME; fi
[[ -n "$PROJECT_NAME" ]] || { echo "Project name is required." >&2; exit 1; }
SAFE_NAME=$(printf '%s' "$PROJECT_NAME" | sed 's/[^a-zA-Z0-9_-]/-/g')
command -v node >/dev/null 2>&1 || { echo "Node.js is required." >&2; exit 1; }
PYTHON_BIN="${PYTHON:-}"
if [[ -z "$PYTHON_BIN" ]]; then
  if command -v python3 >/dev/null 2>&1; then PYTHON_BIN=python3;
  elif command -v python >/dev/null 2>&1; then PYTHON_BIN=python;
  else echo "Python 3.10+ is required." >&2; exit 1; fi
fi
node scripts/awf/init.mjs --project-name "$SAFE_NAME" --root .

for pair in "envs/.env.example:.env" "envs/.env.local.example:.env.local" "envs/.env.test.example:.env.test"; do src="${pair%%:*}"; dst="${pair##*:}"; [[ -f "$src" && ! -f "$dst" ]] && cp "$src" "$dst" || true; done
[[ -f credentials/credentials.example.toml && ! -f credentials/credentials.toml ]] && cp credentials/credentials.example.toml credentials/credentials.toml || true
[[ -f credentials/telegram.env.example && ! -f credentials/telegram.env ]] && cp credentials/telegram.env.example credentials/telegram.env || true
if [[ "$NON_INTERACTIVE" == false ]]; then
  if [[ "$ENABLE_BRAIN" == false ]]; then read -r -p "Enable Second Brain? (y/N) " a; [[ "$a" =~ ^[Yy]$ ]] && ENABLE_BRAIN=true; fi
  if [[ "$ENABLE_GITNEXUS" == false ]]; then read -r -p "Enable GitNexus? (y/N) " a; [[ "$a" =~ ^[Yy]$ ]] && ENABLE_GITNEXUS=true; fi
  if [[ "$ENABLE_CODEBASE_MEMORY" == false ]]; then read -r -p "Enable Codebase-Memory? (y/N) " a; [[ "$a" =~ ^[Yy]$ ]] && ENABLE_CODEBASE_MEMORY=true; fi
fi
if [[ "$ENABLE_GITNEXUS" == true ]]; then
  npx -y gitnexus@1.6.10 analyze --skip-embeddings
  npx -y gitnexus@1.6.10 setup
fi
if [[ "$ENABLE_CODEBASE_MEMORY" == true ]]; then
  echo "WARN: Codebase-Memory requested. AWF will not execute an unpinned remote installer; configure it explicitly after reviewing its release."
fi
node scripts/awf/configure.mjs --root . \
  --integration "second_brain=$ENABLE_BRAIN" \
  --integration "gitnexus=$ENABLE_GITNEXUS" \
  --integration "codebase_memory=$ENABLE_CODEBASE_MEMORY"
[[ "$SKIP_DEPS" == true ]] || node scripts/awf/exec.mjs install --root .
"$PYTHON_BIN" .agent/scripts/checklist.py . --core
if [[ "$SKIP_GIT" == false && ! -d .git ]]; then git init; git add .; git commit -m "chore: initialize project from AWF template"; fi
echo "Setup complete for $SAFE_NAME"
echo "Next: fill credentials and update .planning/PROJECT.md description/stack."
