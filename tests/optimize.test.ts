/// <reference types="node" />

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const scriptPath = resolve("scripts/maintenance/optimize.mjs");
const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function createTempGitRepo() {
  const root = mkdtempSync(join(tmpdir(), "awf-optimize-test-"));
  tempRoots.push(root);

  // Initialize git repo
  spawnSync("git", ["init", "-b", "main"], { cwd: root });
  spawnSync("git", ["config", "user.name", "Test User"], { cwd: root });
  spawnSync("git", ["config", "user.email", "test@example.com"], { cwd: root });

  // Initial commits
  writeFileSync(join(root, "README.md"), "# Test Repo\n");
  spawnSync("git", ["add", "README.md"], { cwd: root });
  spawnSync("git", ["commit", "-m", "initial commit"], { cwd: root });

  return root;
}

function runOptimize(repoRoot: string, args: string[]) {
  return spawnSync("node", [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

describe("Git Optimizer Script", () => {
  test("Flow: init -> improve -> regress -> finish", () => {
    const repo = createTempGitRepo();

    // Create target file and benchmark script
    const targetFile = join(repo, "algorithm.js");
    writeFileSync(targetFile, "const size = 100;\n");
    spawnSync("git", ["add", "algorithm.js"], { cwd: repo });
    spawnSync("git", ["commit", "-m", "add algorithm.js"], { cwd: repo });

    const benchFile = join(repo, "bench.js");
    writeFileSync(
      benchFile,
      `
      const fs = require('fs');
      const content = fs.readFileSync('algorithm.js', 'utf8');
      const sizeMatch = content.match(/size\\s*=\\s*(\\d+)/);
      const size = sizeMatch ? parseInt(sizeMatch[1]) : 100;
      console.log('Result Score: ' + size);
      `,
    );
    spawnSync("git", ["add", "bench.js"], { cwd: repo });
    spawnSync("git", ["commit", "-m", "add bench.js"], { cwd: repo });

    // 1. Initialize Optimizer (optimize 'Score' in 'higher' direction)
    const initRes = runOptimize(repo, [
      "init",
      "--target",
      "algorithm.js",
      "--run-cmd",
      "node bench.js",
      "--metric-pattern",
      "Result Score: (\\d+)",
      "--direction",
      "higher",
    ]);

    expect(initRes.status).toBe(0);
    expect(existsSync(join(repo, ".agent", "optimize-state.json"))).toBe(true);

    const state1 = JSON.parse(
      readFileSync(join(repo, ".agent", "optimize-state.json"), "utf8"),
    );
    expect(state1.baselineMetric).toBe(100);
    expect(state1.bestMetric).toBe(100);
    expect(state1.originalBranch).toBe("main");

    // Check we switched branch
    const branchRes = spawnSync("git", ["branch", "--show-current"], {
      cwd: repo,
      encoding: "utf8",
    });
    const currentBranch = branchRes.stdout.trim();
    expect(currentBranch).toBe(state1.tempBranch);

    // 2. Modify to IMPROVE (size = 150)
    writeFileSync(targetFile, "const size = 150;\n");
    const eval1Res = runOptimize(repo, ["evaluate"]);
    expect(eval1Res.status).toBe(0);
    expect(eval1Res.stdout).toContain('"improved": true');

    const state2 = JSON.parse(
      readFileSync(join(repo, ".agent", "optimize-state.json"), "utf8"),
    );
    expect(state2.bestMetric).toBe(150);

    // 3. Modify to REGRESS (size = 50)
    writeFileSync(targetFile, "const size = 50;\n");
    const eval2Res = runOptimize(repo, ["evaluate"]);
    expect(eval2Res.status).toBe(0);
    expect(eval2Res.stdout).toContain('"improved": false');

    // The file should have been reverted back to 150
    const contentAfterRevert = readFileSync(targetFile, "utf8");
    expect(contentAfterRevert.replace(/\r\n/g, "\n")).toBe(
      "const size = 150;\n",
    );

    // 4. Finish Optimizer and verify merge
    const finishRes = runOptimize(repo, ["finish"]);
    expect(finishRes.status).toBe(0);

    // Verify branch switched back
    const finalBranchRes = spawnSync("git", ["branch", "--show-current"], {
      cwd: repo,
      encoding: "utf8",
    });
    expect(finalBranchRes.stdout.trim()).toBe("main");

    // Verify file content is 150 on main branch
    expect(readFileSync(targetFile, "utf8").replace(/\r\n/g, "\n")).toBe(
      "const size = 150;\n",
    );

    // State file is deleted
    expect(existsSync(join(repo, ".agent", "optimize-state.json"))).toBe(false);
  });

  test("Given dirty working tree, when finish is run, then it blocks", () => {
    const repo = createTempGitRepo();
    const targetFile = join(repo, "algorithm.js");
    writeFileSync(targetFile, "const size = 100;\n");
    spawnSync("git", ["add", "algorithm.js"], { cwd: repo });
    spawnSync("git", ["commit", "-m", "add algorithm.js"], { cwd: repo });

    const benchFile = join(repo, "bench.js");
    writeFileSync(benchFile, 'console.log("Result Score: 100");');
    spawnSync("git", ["add", "bench.js"], { cwd: repo });
    spawnSync("git", ["commit", "-m", "add bench.js"], { cwd: repo });

    // Init
    runOptimize(repo, [
      "init",
      "--target",
      "algorithm.js",
      "--run-cmd",
      "node bench.js",
      "--metric-pattern",
      "Result Score: (\\d+)",
    ]);

    // Create a dirty edit
    writeFileSync(targetFile, "const size = 101;\n");

    // Run finish -> should exit non-zero due to dirty edits
    const finishRes = runOptimize(repo, ["finish"]);
    expect(finishRes.status).not.toBe(0);
    expect(finishRes.stdout).toContain(
      "Cannot finish. You have uncommitted / unevaluated changes",
    );

    // Clean up repo so we don't leak branches/files in temp dir
    spawnSync("git", ["reset", "--hard"], { cwd: repo });
    runOptimize(repo, ["finish"]);
  });

  test("Given benchmark command fails (non-zero status), when evaluate is run, then changes are reverted", () => {
    const repo = createTempGitRepo();
    const targetFile = join(repo, "algorithm.js");
    writeFileSync(targetFile, "const size = 100;\n");
    spawnSync("git", ["add", "algorithm.js"], { cwd: repo });
    spawnSync("git", ["commit", "-m", "add algorithm.js"], { cwd: repo });

    const benchFile = join(repo, "bench.js");
    // Init with working bench
    writeFileSync(benchFile, 'console.log("Result Score: 100");');
    spawnSync("git", ["add", "bench.js"], { cwd: repo });
    spawnSync("git", ["commit", "-m", "add bench.js"], { cwd: repo });

    runOptimize(repo, [
      "init",
      "--target",
      "algorithm.js",
      "--run-cmd",
      "node bench.js",
      "--metric-pattern",
      "Result Score: (\\d+)",
      "--direction",
      "higher",
    ]);

    // Now overwrite bench file to exit with non-zero
    writeFileSync(
      benchFile,
      'console.log("Result Score: 150"); process.exit(2);',
    );
    // Modify target
    writeFileSync(targetFile, "const size = 150;\n");

    // Evaluate
    const evalRes = runOptimize(repo, ["evaluate"]);
    expect(evalRes.stdout).toContain('"reason": "benchmark_failed"');

    // algorithm.js should be reverted
    const content = readFileSync(targetFile, "utf8");
    expect(content.replace(/\r\n/g, "\n")).toBe("const size = 100;\n");

    // Clean up
    runOptimize(repo, ["finish"]);
  });

  test("Given invalid direction value, when init is run, then it fails", () => {
    const repo = createTempGitRepo();
    const targetFile = join(repo, "algorithm.js");
    writeFileSync(targetFile, "const size = 100;\n");
    spawnSync("git", ["add", "algorithm.js"], { cwd: repo });
    spawnSync("git", ["commit", "-m", "add algorithm.js"], { cwd: repo });

    const benchFile = join(repo, "bench.js");
    writeFileSync(benchFile, 'console.log("Result Score: 100");');
    spawnSync("git", ["add", "bench.js"], { cwd: repo });
    spawnSync("git", ["commit", "-m", "add bench.js"], { cwd: repo });

    // Run init with invalid direction -> should exit non-zero
    const initRes = runOptimize(repo, [
      "init",
      "--target",
      "algorithm.js",
      "--run-cmd",
      "node bench.js",
      "--metric-pattern",
      "Result Score: (\\d+)",
      "--direction",
      "lowre",
    ]);
    expect(initRes.status).not.toBe(0);
    expect(initRes.stdout).toContain("Invalid direction: lowre");
  });

  test("Given benchmark command fails on baseline, when init is run, then it fails", () => {
    const repo = createTempGitRepo();
    const targetFile = join(repo, "algorithm.js");
    writeFileSync(targetFile, "const size = 100;\n");
    spawnSync("git", ["add", "algorithm.js"], { cwd: repo });
    spawnSync("git", ["commit", "-m", "add algorithm.js"], { cwd: repo });

    const benchFile = join(repo, "bench.js");
    // Crashing benchmark
    writeFileSync(
      benchFile,
      'console.log("Result Score: 100"); process.exit(1);',
    );
    spawnSync("git", ["add", "bench.js"], { cwd: repo });
    spawnSync("git", ["commit", "-m", "add bench.js"], { cwd: repo });

    // Run init -> should fail since benchmark command fails
    const initRes = runOptimize(repo, [
      "init",
      "--target",
      "algorithm.js",
      "--run-cmd",
      "node bench.js",
      "--metric-pattern",
      "Result Score: (\\d+)",
    ]);
    expect(initRes.status).not.toBe(0);
    expect(initRes.stdout).toContain(
      "Baseline benchmark failed with non-zero exit code during initialization",
    );
  });
});
