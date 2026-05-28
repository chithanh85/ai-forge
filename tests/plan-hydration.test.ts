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

const hydratePath = resolve(".agent/scripts/plan_hydrate.py");
const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function createPlanFixture() {
  const root = mkdtempSync(join(tmpdir(), "awf-plan-hydrate-"));
  tempRoots.push(root);

  const planDir = join(root, "docs", "plans", "checkout-flow");
  mkdirSync(planDir, { recursive: true });
  writeFileSync(join(planDir, "index.md"), "# Checkout Flow\n\nShared plan.");
  writeFileSync(
    join(planDir, "phase-01-contract.md"),
    "# Phase 01\n\nContract work.",
  );
  writeFileSync(
    join(planDir, "phase-02-implementation.md"),
    "# Phase 02\n\nImplementation work.",
  );
  writeFileSync(
    join(planDir, "current-phase.txt"),
    "phase-02-implementation.md\n",
  );

  writeFileSync(join(root, "docs", "plans", "legacy-plan.md"), "# Legacy\n");

  return { root, planDir };
}

function runHydrate(root: string, args: string[]) {
  return spawnSync("python", [hydratePath, ...args], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8",
    },
  });
}

describe("plan hydration CLI", () => {
  test("lists split plan folders and ignores legacy monolithic plan files", () => {
    const { root } = createPlanFixture();

    const result = runHydrate(root, ["list"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("checkout-flow");
    expect(result.stdout).not.toContain("legacy-plan");
  });

  test("hydrates only the active phase plus the plan index", () => {
    const { root } = createPlanFixture();

    const result = runHydrate(root, ["context", "checkout-flow"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Shared plan.");
    expect(result.stdout).toContain("Implementation work.");
    expect(result.stdout).not.toContain("Contract work.");
  });

  test("sets and reports the active phase", () => {
    const { root, planDir } = createPlanFixture();

    const setResult = runHydrate(root, [
      "set",
      "checkout-flow",
      "phase-01-contract.md",
    ]);
    const activeResult = runHydrate(root, ["active", "checkout-flow"]);

    expect(setResult.status).toBe(0);
    expect(activeResult.status).toBe(0);
    expect(activeResult.stdout.trim()).toBe("phase-01-contract.md");
    expect(
      readFileSync(join(planDir, "current-phase.txt"), "utf8").trim(),
    ).toBe("phase-01-contract.md");
  });
});
