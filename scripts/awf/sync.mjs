#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const START = "<!-- awf:managed:start -->";
const END = "<!-- awf:managed:end -->";

function parseArgs(argv) {
  const out = { root: process.cwd() };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") out.root = argv[++i] ?? "";
    else if (arg === "--help" || arg === "-h") out.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return out;
}

function readManifest(root) {
  const path = join(root, ".awf", "manifest.json");
  if (!existsSync(path)) throw new Error(".awf/manifest.json not found. Run AWF init first.");
  return JSON.parse(readFileSync(path, "utf8"));
}

function managedBlock(client, manifest) {
  const name = manifest?.project?.name ?? "project";
  const manager = manifest?.toolchain?.package_manager ?? "auto";
  const clientNotes = {
    agents: "Use this adapter for Codex and other AGENTS.md-compatible clients.",
    gemini: "Use Gemini/Antigravity-native tools when available; do not invent unsupported subagent or browser capabilities.",
    claude: "Use Claude-native tools when available; do not assume Gemini or Codex-specific syntax.",
  };
  return `${START}\n# AWF Native Adapter\n\n- Project: **${name}**\n- Package manager: **${manager}**\n- MUST read \`.awf/policy/core.md\` before non-trivial work.\n- MUST consult \`.agent/rules/rationalization-prevention.md\` before code writing or completion claims.\n- Resolve quality commands from \`.awf/manifest.json\`; do not hard-code a package manager.\n- Model/provider selection is client/user-owned.\n- Optional integrations are capability-detected and must degrade gracefully.\n- ${clientNotes[client]}\n${END}`;
}

function mergeManaged(current, block) {
  const start = current.indexOf(START);
  const end = current.indexOf(END);
  if (start >= 0 && end >= start) {
    const tailStart = end + END.length;
    return `${current.slice(0, start)}${block}${current.slice(tailStart)}`;
  }
  if (!current.trim()) return `${block}\n`;
  return `${block}\n\n${current}`;
}

function syncFile(path, block) {
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  const next = mergeManaged(current, block);
  if (next !== current) writeFileSync(path, next, "utf8");
}

export function syncAwf({ root = process.cwd() } = {}) {
  const resolvedRoot = resolve(root);
  const manifest = readManifest(resolvedRoot);
  syncFile(join(resolvedRoot, "AGENTS.md"), managedBlock("agents", manifest));
  syncFile(join(resolvedRoot, "GEMINI.md"), managedBlock("gemini", manifest));
  syncFile(join(resolvedRoot, "CLAUDE.md"), managedBlock("claude", manifest));
  return manifest;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write("Usage: node scripts/awf/sync.mjs [--root PATH]\n");
    return;
  }
  const manifest = syncAwf({ root: args.root });
  process.stdout.write(`AWF adapters synced for ${manifest.project.name}.\n`);
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
