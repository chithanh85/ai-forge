#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

function parseArgs(argv) {
  const out = { root: process.cwd() };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--root") out.root = argv[++i] ?? "";
    else if (argv[i] === "--help" || argv[i] === "-h") out.help = true;
    else throw new Error(`Unknown option: ${argv[i]}`);
  }
  return out;
}

function readText(path) {
  if (!existsSync(path)) return "";
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function walkFiles(root) {
  if (!existsSync(root)) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) stack.push(path);
      else out.push(path);
    }
  }
  return out;
}

function detectManager(root) {
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(root, "yarn.lock"))) return "yarn";
  if (existsSync(join(root, "bun.lock")) || existsSync(join(root, "bun.lockb"))) return "bun";
  if (existsSync(join(root, "package-lock.json"))) return "npm";
  return "npm";
}

function add(findings, level, id, detail, fix = "") {
  findings.push({ level, id, detail, fix });
}

export function diagnoseAwf({ root = process.cwd() } = {}) {
  const resolvedRoot = resolve(root);
  const findings = [];
  const manifestPath = join(resolvedRoot, ".awf", "manifest.json");
  let manifest = null;
  if (!existsSync(manifestPath)) {
    add(findings, "FAIL", "manifest", ".awf/manifest.json is missing", "Run AWF init.");
  } else {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      add(findings, "PASS", "manifest", `schema v${manifest.schema_version ?? "?"}`);
    } catch (error) {
      add(findings, "FAIL", "manifest", `invalid JSON: ${error.message}`);
    }
  }

  if (manifest) {
    const detected = detectManager(resolvedRoot);
    const configured = manifest?.toolchain?.package_manager;
    if (detected === configured) add(findings, "PASS", "package-manager", detected);
    else add(findings, "FAIL", "package-manager", `manifest=${configured}, detected=${detected}`, "Run AWF init/sync after lockfile changes.");
  }

  for (const file of ["AGENTS.md", "GEMINI.md", "CLAUDE.md"]) {
    const text = readText(join(resolvedRoot, file));
    const starts = (text.match(/<!-- awf:managed:start -->/g) ?? []).length;
    const ends = (text.match(/<!-- awf:managed:end -->/g) ?? []).length;
    if (starts === 1 && ends === 1) add(findings, "PASS", `adapter:${file}`, "managed region present");
    else add(findings, "WARN", `adapter:${file}`, `managed markers start=${starts}, end=${ends}`, "Run AWF sync.");
  }

  const mcp = readText(join(resolvedRoot, ".mcp.json"));
  if (/@latest\b/.test(mcp)) add(findings, "FAIL", "mcp-pin", "runtime @latest found in .mcp.json", "Pin executable integration versions.");
  else add(findings, "PASS", "mcp-pin", "no runtime @latest in .mcp.json");

  const managedFiles = walkFiles(join(resolvedRoot, ".agent", "workflows"));
  const codexConfig = join(resolvedRoot, ".codex", "config.toml");
  if (existsSync(codexConfig)) managedFiles.push(codexConfig);
  const dangerous = [];
  const modelPins = [];
  for (const file of managedFiles) {
    const text = readText(file);
    if (/danger-full-access|dangerously-bypass-(approvals-and-sandbox|hook-trust)/.test(text)) dangerous.push(file);
    if (/\b(?:gpt|gemini|claude)-\d[\w.-]*\b/i.test(text)) modelPins.push(file);
  }
  if (dangerous.length) add(findings, "FAIL", "unsafe-bypass", `${dangerous.length} managed file(s) bypass client safety`, "Remove shared-workflow safety bypass flags.");
  else add(findings, "PASS", "unsafe-bypass", "no managed safety bypass flags");
  if (modelPins.length) add(findings, "WARN", "model-pins", `${modelPins.length} managed file(s) contain concrete model identifiers`, "Prefer capability roles or project-local opt-in model config.");
  else add(findings, "PASS", "model-pins", "no concrete model pins in managed workflows/config");

  const pkgPath = join(resolvedRoot, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      const build = String(pkg?.scripts?.build ?? "");
      if (/\becho\b.*configure.*build/i.test(build)) add(findings, "WARN", "build", "build command is a placeholder", "Treat project build as NOT_CONFIGURED until a real build exists.");
      else if (build) add(findings, "PASS", "build", build);
      else add(findings, "WARN", "build", "no build command configured");
    } catch {
      add(findings, "WARN", "build", "package.json could not be parsed");
    }
  }

  return findings;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write("Usage: node scripts/awf/doctor.mjs [--root PATH]\n");
    return;
  }
  const findings = diagnoseAwf({ root: args.root });
  const weights = { PASS: 0, WARN: 1, FAIL: 3 };
  const penalty = findings.reduce((sum, finding) => sum + weights[finding.level], 0);
  const score = Math.max(0, 100 - penalty * 5);
  process.stdout.write(`AWF Doctor: ${score}/100\n`);
  for (const finding of findings) {
    process.stdout.write(`${finding.level.padEnd(4)} ${finding.id}: ${finding.detail}\n`);
    if (finding.fix) process.stdout.write(`     Fix: ${finding.fix}\n`);
  }
  if (findings.some((finding) => finding.level === "FAIL")) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
