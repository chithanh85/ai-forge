/// <reference types="node" />

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const pythonExe =
  process.env.PYTHON ?? (process.platform === "win32" ? "python" : "python3");

const wikiLintPath = resolve(".agent/scripts/wiki_lint.py");
const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function createWikiRoot() {
  const root = mkdtempSync(join(tmpdir(), "awf-wiki-lint-"));
  tempRoots.push(root);

  mkdirSync(join(root, "docs", "wiki"), { recursive: true });
  writeFileSync(join(root, "docs", "wiki", "home.md"), "# Home\n");
  writeFileSync(join(root, "docs", "wiki-index.md"), "# Wiki\n");

  return root;
}

function runWikiLint(root: string, args: string[]) {
  return spawnSync(pythonExe, [wikiLintPath, ...args], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8",
    },
  });
}

describe("wiki lint strict mode", () => {
  test("fails in strict mode when a wikilink is broken", () => {
    const root = createWikiRoot();
    writeFileSync(
      join(root, "docs", "wiki", "home.md"),
      "# Home\n\nSee [[wiki/missing-page]].\n",
    );

    const result = runWikiLint(root, ["--strict"]);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("missing-page");
  });

  test("keeps non-strict broken links as warnings", () => {
    const root = createWikiRoot();
    writeFileSync(
      join(root, "docs", "wiki", "home.md"),
      "# Home\n\nSee [[wiki/missing-page]].\n",
    );

    const result = runWikiLint(root, []);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Warnings");
  });

  test("emits machine-readable JSON results", () => {
    const root = createWikiRoot();
    writeFileSync(
      join(root, "docs", "wiki", "home.md"),
      "# Home\n\nSee [[wiki/missing-page]].\n",
    );

    const result = runWikiLint(root, ["--strict", "--json"]);

    expect(result.status).toBe(1);
    const payload = JSON.parse(result.stdout) as {
      ok: boolean;
      warnings: string[];
    };
    expect(payload.ok).toBe(false);
    expect(payload.warnings.join("\n")).toContain("missing-page");
  });

  test("changed mode only checks staged wiki files", () => {
    const root = createWikiRoot();
    writeFileSync(join(root, "docs", "wiki", "changed.md"), "# Changed\n");
    writeFileSync(
      join(root, "docs", "wiki", "unstaged.md"),
      "# Unstaged\n\n[[wiki/missing-only-in-unstaged]]\n",
    );

    spawnSync("git", ["init"], { cwd: root, encoding: "utf8" });
    spawnSync("git", ["add", "docs/wiki-index.md", "docs/wiki/changed.md"], {
      cwd: root,
      encoding: "utf8",
    });

    const result = runWikiLint(root, ["--strict", "--changed"]);

    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain("missing-only-in-unstaged");
  });
});
