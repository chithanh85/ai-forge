#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { syncAwf } from "./sync.mjs";

const DEFAULT_ROOT = process.cwd();

function parseArgs(argv) {
  const out = { root: DEFAULT_ROOT, projectName: "" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") out.root = argv[++i] ?? "";
    else if (arg === "--project-name" || arg === "-p") out.projectName = argv[++i] ?? "";
    else if (arg === "--help" || arg === "-h") out.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return out;
}

function safeProjectName(value) {
  const normalized = String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
  if (!normalized) throw new Error("Project name is required. Use --project-name <name>.");
  return normalized;
}

function detectPackageManager(root) {
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(root, "yarn.lock"))) return "yarn";
  if (existsSync(join(root, "bun.lock")) || existsSync(join(root, "bun.lockb"))) return "bun";
  if (existsSync(join(root, "package-lock.json"))) return "npm";
  const packageJsonPath = join(root, "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
      const manager = String(pkg.packageManager || "").split("@")[0];
      if (["npm", "pnpm", "yarn", "bun"].includes(manager)) return manager;
    } catch {
      // Invalid package.json will be reported by the caller's normal project checks.
    }
  }
  return "npm";
}

function commandMap(manager) {
  const maps = {
    npm: {
      install: "npm ci",
      test: "npm test",
      lint: "npm run lint",
      typecheck: "npm run typecheck",
      build: "npm run build",
      format: "npm run format",
    },
    pnpm: {
      install: "pnpm install --frozen-lockfile",
      test: "pnpm test",
      lint: "pnpm lint",
      typecheck: "pnpm typecheck",
      build: "pnpm build",
      format: "pnpm format",
    },
    yarn: {
      install: "yarn install --immutable",
      test: "yarn test",
      lint: "yarn lint",
      typecheck: "yarn typecheck",
      build: "yarn build",
      format: "yarn format",
    },
    bun: {
      install: "bun install --frozen-lockfile",
      test: "bun test",
      lint: "bun run lint",
      typecheck: "bun run typecheck",
      build: "bun run build",
      format: "bun run format",
    },
  };
  return maps[manager] ?? maps.npm;
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  const next = `${JSON.stringify(data, null, 2)}\n`;
  if (!existsSync(path) || readFileSync(path, "utf8") !== next) writeFileSync(path, next, "utf8");
}

function replaceInFile(path, transform) {
  if (!existsSync(path)) return false;
  const current = readFileSync(path, "utf8");
  const next = transform(current);
  if (next === current) return false;
  writeFileSync(path, next, "utf8");
  return true;
}

function hydratePackage(root, name) {
  const path = join(root, "package.json");
  if (!existsSync(path)) return;
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  if (pkg.name === "ai-forge" || pkg.name === "awf-enterprise-template" || !pkg.name) {
    pkg.name = name;
    writeJson(path, pkg);
  }
}

function hydrateProjectDoc(root, name) {
  const path = join(root, ".planning", "PROJECT.md");
  replaceInFile(path, (text) =>
    text
      .replace(/^_Your project name_$/m, name)
      .replace(/^_One-paragraph description of what this project does\._$/m, "_Describe what this project does._"),
  );
}

function freshState(name, manager) {
  return `# Project State — AI reads this FIRST at every session\n\n## Current Phase\n\n- [x] AWF initialized for **${name}**\n- [ ] Planning\n- [ ] Design\n- [ ] Implementation\n- [ ] Testing\n- [ ] Deployment\n\n## Toolchain\n\n- Package manager: **${manager}**\n- Canonical configuration: \`.awf/manifest.json\`\n\n## Last Session\n\n_No project session recorded yet._\n\n## Active Tasks\n\n_None._\n\n## Known Issues\n\n_None._\n`;
}

export function initializeAwf({ root = DEFAULT_ROOT, projectName }) {
  const resolvedRoot = resolve(root);
  const name = safeProjectName(projectName);
  const manager = detectPackageManager(resolvedRoot);
  const commands = commandMap(manager);

  hydratePackage(resolvedRoot, name);
  hydrateProjectDoc(resolvedRoot, name);

  const codexConfig = join(resolvedRoot, ".codex", "config.toml");
  replaceInFile(codexConfig, (text) =>
    text.replace(/name\s*=\s*"(?:\{\{AWF_PROJECT_NAME\}\}|ai-forge|awf-enterprise-template)"/, `name = "${name}"`),
  );

  const statePath = join(resolvedRoot, ".planning", "STATE.md");
  mkdirSync(dirname(statePath), { recursive: true });
  const nextState = freshState(name, manager);
  if (!existsSync(statePath) || readFileSync(statePath, "utf8") !== nextState) {
    writeFileSync(statePath, nextState, "utf8");
  }

  const manifest = {
    schema_version: 1,
    project: { name },
    toolchain: {
      package_manager: manager,
      commands,
    },
    clients: {
      codex: "auto",
      gemini: "auto",
      claude: "auto",
    },
    integrations: {
      gitnexus: false,
      second_brain: false,
      teleport: false,
      open_design: false,
      clawpatch: false,
      codebase_memory: false,
    },
  };
  writeJson(join(resolvedRoot, ".awf", "manifest.json"), manifest);
  syncAwf({ root: resolvedRoot });
  return manifest;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write("Usage: node scripts/awf/init.mjs --project-name NAME [--root PATH]\n");
    return;
  }
  const manifest = initializeAwf({ root: args.root, projectName: args.projectName });
  process.stdout.write(`AWF initialized for ${manifest.project.name} (${manifest.toolchain.package_manager}).\n`);
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
