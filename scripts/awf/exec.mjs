#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const out = { root: process.cwd(), key: "" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") out.root = argv[++i] ?? "";
    else if (!out.key) out.key = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  if (!out.key) throw new Error("Usage: node scripts/awf/exec.mjs <install|test|lint|typecheck|build|format> [--root PATH]");
  return out;
}

const args = parseArgs(process.argv.slice(2));
const root = resolve(args.root);
const manifest = JSON.parse(readFileSync(join(root, ".awf", "manifest.json"), "utf8"));
const command = manifest?.toolchain?.commands?.[args.key];
if (!command) throw new Error(`No AWF command configured for '${args.key}'.`);
process.stdout.write(`[awf:${args.key}] ${command}\n`);
const result = spawnSync(command, { cwd: root, shell: true, stdio: "inherit", env: process.env });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
