/// <reference types="node" />

import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const pythonExe =
  process.env.PYTHON ?? (process.platform === "win32" ? "python" : "python3");
const scannerPath = resolve("scripts/maintenance/debt_scanner.py");
const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("technical debt scanner", () => {
  test("generates clean UTF-8 markdown and matching JSON", () => {
    const root = mkdtempSync(join(tmpdir(), "awf-debt-scanner-"));
    tempRoots.push(root);
    mkdirSync(join(root, "src"), { recursive: true });
    const marker = "TO" + "DO:";
    writeFileSync(
      join(root, "src", "example.ts"),
      `// ${marker} @alice remove compatibility shim\n`,
    );

    const result = spawnSync(
      pythonExe,
      [
        scannerPath,
        "--root",
        root,
        "--output",
        "docs/DEBT_LEDGER.md",
        "--json-output",
        "docs/debt_ledger.json",
      ],
      { encoding: "utf8", env: { ...process.env, PYTHONIOENCODING: "utf-8" } },
    );

    expect(result.status, result.stderr || result.stdout).toBe(0);

    const markdown = readFileSync(join(root, "docs", "DEBT_LEDGER.md"), "utf8");
    expect(markdown).toContain("# Technical Debt Ledger");
    expect(markdown).toContain("**Medium Severity (TODO / DEBT):** 1");
    expect(markdown).toContain("remove compatibility shim");
    expect(markdown).toContain("[src/example.ts:1](../src/example.ts#L1)");
    expect(markdown).not.toContain("�");
    expect(markdown).not.toContain("dY");

    const report = JSON.parse(
      readFileSync(join(root, "docs", "debt_ledger.json"), "utf8"),
    );
    expect(report.total).toBe(1);
    expect(report.items[0].tag).toBe("TODO");
    expect(report.items[0].owner).toBe("alice");
  });
});
