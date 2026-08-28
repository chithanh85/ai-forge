#!/usr/bin/env bash
set -euo pipefail
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
python - "$SAFE_NAME" <<'PY'
import json, pathlib, re, sys
name=sys.argv[1]
p=pathlib.Path('package.json'); d=json.loads(p.read_text()); d['name']=name; p.write_text(json.dumps(d,indent=2)+'\n')
p=pathlib.Path('.planning/PROJECT.md'); t=p.read_text(); t=re.sub(r'(?m)^_Your project name_$',name,t); t=t.replace('_One-paragraph description of what this project does._','_Describe what this project does._'); p.write_text(t)
p=pathlib.Path('.planning/STATE.md'); t=p.read_text().replace('AI Forge v4.0.2','AI Forge v4.0.3'); p.write_text(t)
PY
for pair in "envs/.env.example:.env" "envs/.env.local.example:.env.local" "envs/.env.test.example:.env.test"; do src="${pair%%:*}"; dst="${pair##*:}"; [[ -f "$src" && ! -f "$dst" ]] && cp "$src" "$dst" || true; done
[[ -f credentials/credentials.example.toml && ! -f credentials/credentials.toml ]] && cp credentials/credentials.example.toml credentials/credentials.toml || true
[[ -f credentials/telegram.env.example && ! -f credentials/telegram.env ]] && cp credentials/telegram.env.example credentials/telegram.env || true
if [[ "$NON_INTERACTIVE" == false ]]; then
  if [[ "$ENABLE_BRAIN" == false ]]; then read -r -p "Enable Second Brain? (y/N) " a; [[ "$a" =~ ^[Yy]$ ]] && ENABLE_BRAIN=true; fi
  if [[ "$ENABLE_GITNEXUS" == false ]]; then read -r -p "Enable GitNexus? (y/N) " a; [[ "$a" =~ ^[Yy]$ ]] && ENABLE_GITNEXUS=true; fi
  if [[ "$ENABLE_CODEBASE_MEMORY" == false ]]; then read -r -p "Enable Codebase-Memory? (y/N) " a; [[ "$a" =~ ^[Yy]$ ]] && ENABLE_CODEBASE_MEMORY=true; fi
fi
if [[ "$ENABLE_GITNEXUS" == true ]] && command -v gitnexus >/dev/null 2>&1; then gitnexus analyze --skip-embeddings || true; fi
[[ "$SKIP_DEPS" == true ]] || npm ci
[[ "$SKIP_DEPS" == true || "$SKIP_GIT" == true ]] || npx husky install 2>/dev/null || true
npm run lint:check
npm run typecheck
npm test
python .agent/scripts/wiki_lint.py --strict
python .agent/scripts/checklist.py .
if [[ "$SKIP_GIT" == false && ! -d .git ]]; then git init; git add .; git commit -m "chore: initialize project from AWF template"; fi
echo "Setup complete for $SAFE_NAME"
echo "Next: fill credentials and update .planning/PROJECT.md description/stack."
