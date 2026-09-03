#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { syncAwf } from "./sync.mjs";

function parseArgs(argv) {
  const out = { root: process.cwd(), integrations: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") out.root = argv[++i] ?? "";
    else if (arg === "--integration") out.integrations.push(argv[++i] ?? "");
    else if (arg === "--help" || arg === "-h") out.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return out;
}

function parseBoolean(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Integration value must be true or false, got '${value}'.`);
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  process.stdout.write("Usage: node scripts/awf/configure.mjs --integration NAME=true [--integration NAME=false] [--root PATH]\n");
  process.exit(0);
}
const root = resolve(args.root);
const path = join(root, ".awf", "manifest.json");
const manifest = JSON.parse(readFileSync(path, "utf8"));
manifest.integrations ??= {};
for (const item of args.integrations) {
  const [name, rawValue] = item.split("=", 2);
  if (!name || rawValue === undefined) throw new Error(`Invalid --integration '${item}'. Use NAME=true|false.`);
  manifest.integrations[name] = parseBoolean(rawValue);
}
const next = `${JSON.stringify(manifest, null, 2)}\n`;
if (readFileSync(path, "utf8") !== next) writeFileSync(path, next, "utf8");
syncAwf({ root });
process.stdout.write("AWF integration configuration updated.\n");
