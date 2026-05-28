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
import { afterEach, describe, expect, test } from "vitest";

const runnerPath = resolve(".agent/scripts/worktree_runner.py");
const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function createTempGitRepo() {
  const root = mkdtempSync(join(tmpdir(), "awf-worktree-test-"));
  tempRoots.push(root);

  // Initialize git repo
  spawnSync("git", ["init", "-b", "main"], { cwd: root });
  spawnSync("git", ["config", "user.name", "Test User"], { cwd: root });
  spawnSync("git", ["config", "user.email", "test@example.com"], { cwd: root });

  // Initial commit (worktree needs at least one commit to base on)
  writeFileSync(join(root, "README.md"), "# Test Repo\n");
  spawnSync("git", ["add", "README.md"], { cwd: root });
  spawnSync("git", ["commit", "-m", "initial commit"], { cwd: root });

  // Make sure checkpoints directory exists if script writes to it
  mkdirSync(join(root, ".agent", "checkpoints"), { recursive: true });

  return root;
}

function runWorktreeRunner(repoRoot: string, args: string[]) {
  return spawnSync("python", [runnerPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8",
    },
  });
}

describe("worktree runner CLI", () => {
  test("Given clean repo, when run executes command, then cwd is inside worktree and proof file exists only in branch", () => {
    const repo = createTempGitRepo();
    const runId = "run-ok";

    const result = runWorktreeRunner(repo, [
      "run",
      "--run-id",
      runId,
      "--task",
      "Test task",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
      "--base-ref",
      "main",
      "--cleanup",
      "never",
      "--",
      "python",
      "-c",
      "import os, pathlib; pathlib.Path('runner-proof.txt').write_text(os.getcwd())",
    ]);

    expect(result.status).toBe(0);

    // Proof file should exist in the worktree directory, not the main repo
    const worktreePath = join(repo, ".tmp", "worktrees", runId);
    const proofFileInWorktree = join(worktreePath, "runner-proof.txt");
    const proofFileInRepo = join(repo, "runner-proof.txt");

    expect(existsSync(proofFileInWorktree)).toBe(true);
    expect(existsSync(proofFileInRepo)).toBe(false);

    const proofContent = readFileSync(proofFileInWorktree, "utf8");
    expect(resolve(proofContent).replace(/\\/g, "/")).toBe(
      resolve(worktreePath).replace(/\\/g, "/"),
    );
  });

  test("Given --cleanup on-success, when command exits zero, then worktree is removed", () => {
    const repo = createTempGitRepo();
    const runId = "run-cleanup";

    const result = runWorktreeRunner(repo, [
      "run",
      "--run-id",
      runId,
      "--task",
      "Test cleanup",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
      "--base-ref",
      "main",
      "--cleanup",
      "on-success",
      "--",
      "python",
      "-c",
      "print('done')",
    ]);

    expect(result.status).toBe(0);

    const worktreePath = join(repo, ".tmp", "worktrees", runId);
    expect(existsSync(worktreePath)).toBe(false);
  });

  test("Given command exits 7, when runner completes, then process exits 7 and worktree remains", () => {
    const repo = createTempGitRepo();
    const runId = "run-fail";

    const result = runWorktreeRunner(repo, [
      "run",
      "--run-id",
      runId,
      "--task",
      "Test failure",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
      "--base-ref",
      "main",
      "--cleanup",
      "on-success",
      "--",
      "python",
      "-c",
      "import sys; sys.exit(7)",
    ]);

    expect(result.status).toBe(7);

    // Worktree should NOT be cleaned up because command failed
    const worktreePath = join(repo, ".tmp", "worktrees", runId);
    expect(existsSync(worktreePath)).toBe(true);

    // Checkpoint should be updated to failed
    const checkpointPath = join(
      repo,
      ".agent",
      "checkpoints",
      runId,
      "checkpoint.json",
    );
    expect(existsSync(checkpointPath)).toBe(true);
    const checkpoint = JSON.parse(readFileSync(checkpointPath, "utf8"));
    expect(checkpoint.state.status).toBe("failed");
  });

  test("Given dirty root and --allow-dirty absent, when runner starts, then it blocks", () => {
    const repo = createTempGitRepo();
    const runId = "run-dirty-block";

    // Make root repo dirty
    writeFileSync(join(repo, "dirty-file.txt"), "dirty stuff\n");

    const result = runWorktreeRunner(repo, [
      "run",
      "--run-id",
      runId,
      "--task",
      "Test dirty block",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
      "--base-ref",
      "main",
      "--",
      "python",
      "-c",
      "print('should not run')",
    ]);

    expect(result.status).not.toBe(0);

    const checkpointPath = join(
      repo,
      ".agent",
      "checkpoints",
      runId,
      "checkpoint.json",
    );
    expect(existsSync(checkpointPath)).toBe(true);
    const checkpoint = JSON.parse(readFileSync(checkpointPath, "utf8"));
    expect(checkpoint.state.status).toBe("blocked");
  });

  test("Given dirty root and --allow-dirty present, when runner starts, then it proceeds", () => {
    const repo = createTempGitRepo();
    const runId = "run-dirty-allow";

    // Make root repo dirty
    writeFileSync(join(repo, "dirty-file.txt"), "dirty stuff\n");

    const result = runWorktreeRunner(repo, [
      "run",
      "--run-id",
      runId,
      "--task",
      "Test dirty allow",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
      "--base-ref",
      "main",
      "--allow-dirty",
      "--",
      "python",
      "-c",
      "print('ran successfully')",
    ]);

    expect(result.status).toBe(0);

    const checkpointPath = join(
      repo,
      ".agent",
      "checkpoints",
      runId,
      "checkpoint.json",
    );
    expect(existsSync(checkpointPath)).toBe(true);
    const checkpoint = JSON.parse(readFileSync(checkpointPath, "utf8"));
    expect(checkpoint.state.status).toBe("completed");
    expect(checkpoint.repo.dirty_policy).toBe("allow");
  });

  test("Given worktree root outside .tmp/worktrees, when run starts, then it fails before creating worktree", () => {
    const repo = createTempGitRepo();
    const runId = "run-unsafe-path";

    const result = runWorktreeRunner(repo, [
      "run",
      "--run-id",
      runId,
      "--task",
      "Test unsafe path",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
      "--base-ref",
      "main",
      "--worktree-root",
      join(repo, "unsafe-outside-tmp"), // This is outside .tmp/worktrees/
      "--",
      "python",
      "-c",
      "print('unsafe')",
    ]);

    expect(result.status).not.toBe(0);
    expect(existsSync(join(repo, "unsafe-outside-tmp"))).toBe(false);
  });
});
