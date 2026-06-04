#!/usr/bin/env node

import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const STATE_FILE = path.join(process.cwd(), ".agent", "optimize-state.json");

// Helper to run commands and get output
function runCmd(cmd, options = {}) {
  try {
    const stdout = execSync(cmd, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      ...options,
    });
    return { stdout, stderr: "", status: 0 };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      status: error.status || 1,
    };
  }
}

function runCmdArgs(cmd, args, options = {}) {
  try {
    const res = spawnSync(cmd, args, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      ...options,
    });
    return {
      stdout: res.stdout || "",
      stderr: res.stderr || "",
      status: res.status !== null ? res.status : 0,
    };
  } catch (error) {
    return {
      stdout: "",
      stderr: error.message || "",
      status: 1,
    };
  }
}

// Log formatting
function log(msg, type = "info") {
  const colors = {
    info: "\x1b[36m", // Cyan
    success: "\x1b[32m", // Green
    warning: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
    reset: "\x1b[0m",
  };
  console.log(`${colors[type] || ""}[Optimize] ${msg}${colors.reset}`);
}

function printJson(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

// Extract metric using regex pattern
function extractMetric(output, pattern) {
  const regex = new RegExp(pattern);
  const match = output.match(regex);
  if (!match) return null;
  // If there's a capture group, take the first group, otherwise the whole match
  const valStr = match[1] !== undefined ? match[1] : match[0];
  const val = parseFloat(valStr);
  return isNaN(val) ? null : val;
}

// Main logic functions
function init(args) {
  const target = args.target;
  const runCmdStr = args["run-cmd"];
  const pattern = args["metric-pattern"];
  const direction = args.direction || "lower"; // lower or higher
  if (direction !== "lower" && direction !== "higher") {
    log(
      `Invalid direction: ${direction}. Must be 'lower' or 'higher'.`,
      "error",
    );
    process.exit(1);
  }
  const testCmdStr = args["test-cmd"] || "";

  if (!target || !runCmdStr || !pattern) {
    log(
      "Missing required arguments: --target, --run-cmd, --metric-pattern",
      "error",
    );
    process.exit(1);
  }

  // Ensure .agent folder exists
  const agentDir = path.dirname(STATE_FILE);
  if (!fs.existsSync(agentDir)) {
    fs.mkdirSync(agentDir, { recursive: true });
  }

  // Check git status is clean to prevent losing changes
  const gitStatus = runCmd("git status --porcelain");
  if (gitStatus.stdout.trim() !== "") {
    log(
      "Git working tree is not clean. Please commit or stash changes before starting.",
      "error",
    );
    process.exit(1);
  }

  // Get current branch
  const currentBranchRes = runCmd("git branch --show-current");
  const currentBranch = currentBranchRes.stdout.trim() || "main";

  log("Running baseline benchmark...", "info");
  const baselineRun = runCmd(runCmdStr);
  if (baselineRun.status !== 0) {
    log(
      "Baseline benchmark failed with non-zero exit code during initialization.",
      "error",
    );
    log("--- Run Output ---");
    console.log(baselineRun.stdout);
    console.log(baselineRun.stderr);
    process.exit(1);
  }
  const baselineMetric = extractMetric(
    baselineRun.stdout + "\n" + baselineRun.stderr,
    pattern,
  );

  if (baselineMetric === null) {
    log(
      `Failed to extract baseline metric from run output using pattern: ${pattern}`,
      "error",
    );
    log("--- Run Output ---");
    console.log(baselineRun.stdout);
    console.log(baselineRun.stderr);
    process.exit(1);
  }

  log(`Baseline metric established: ${baselineMetric}`, "success");

  const tempBranch = `optimize/opt-${Date.now()}`;
  log(`Creating temporary isolation branch: ${tempBranch}`, "info");

  const branchRes = runCmd(`git checkout -b ${tempBranch}`);
  if (branchRes.status !== 0) {
    log(`Failed to create temp branch: ${branchRes.stderr}`, "error");
    process.exit(1);
  }

  const state = {
    target,
    runCmd: runCmdStr,
    pattern,
    direction,
    testCmd: testCmdStr,
    originalBranch: currentBranch,
    tempBranch,
    baselineMetric,
    bestMetric: baselineMetric,
    history: [
      {
        timestamp: new Date().toISOString(),
        metric: baselineMetric,
        commit: "baseline",
      },
    ],
  };

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  log("Initialization complete. State saved. Start optimizing now!", "success");
  printJson({
    status: "initialized",
    baseline: baselineMetric,
    branch: tempBranch,
  });
}

function evaluate() {
  if (!fs.existsSync(STATE_FILE)) {
    log("No active optimization session found. Run init first.", "error");
    process.exit(1);
  }

  const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  log(`Evaluating changes for target: ${state.target}`, "info");

  log("Running benchmark...", "info");
  const run = runCmd(state.runCmd);
  if (run.status !== 0) {
    log(
      "Benchmark command failed with non-zero exit code. Reverting changes...",
      "error",
    );
    log("--- Benchmark Error ---");
    console.log(run.stdout);
    console.log(run.stderr);
    runCmd("git reset --hard");
    runCmd("git clean -df -e .agent/ -e .codex/");
    printJson({ status: "failed", reason: "benchmark_failed" });
    return;
  }
  const metric = extractMetric(run.stdout + "\n" + run.stderr, state.pattern);

  if (metric === null) {
    log(
      "Failed to extract metric from run output. Reverting changes...",
      "warning",
    );
    runCmd("git reset --hard");
    runCmd("git clean -df -e .agent/ -e .codex/");
    printJson({ status: "failed", reason: "failed_to_extract_metric" });
    return;
  }

  log(`Metric value: ${metric} (Best so far: ${state.bestMetric})`, "info");

  let improved = false;
  if (state.direction === "lower") {
    improved = metric < state.bestMetric;
  } else {
    improved = metric > state.bestMetric;
  }

  if (!improved) {
    log("No metric improvement. Reverting changes...", "warning");
    runCmd("git reset --hard");
    runCmd("git clean -df -e .agent/ -e .codex/");
    printJson({
      status: "rejected",
      improved: false,
      metric,
      best: state.bestMetric,
    });
    return;
  }

  log("Metric improved! Checking safety gates...", "info");

  if (state.testCmd) {
    log(`Running test command: ${state.testCmd}`, "info");
    const testRun = runCmd(state.testCmd);
    if (testRun.status !== 0) {
      log("Safety tests failed. Reverting changes...", "error");
      log("--- Test Failures ---");
      console.log(testRun.stdout);
      console.log(testRun.stderr);
      runCmd("git reset --hard");
      runCmd("git clean -df -e .agent/ -e .codex/");
      printJson({
        status: "rejected",
        reason: "safety_tests_failed",
        metric,
        best: state.bestMetric,
      });
      return;
    }
    log("Safety tests passed!", "success");
  }

  log("All gates passed. Committing changes...", "success");
  // Stage only the optimized scope (the target and any untracked/modified source files)
  const status = runCmd("git status --porcelain -uall");
  const filesToStage = [];
  status.stdout.split("\n").forEach((line) => {
    if (!line) return;
    const statusCode = line.substring(0, 2);
    const filePath = line.substring(2).trim();

    // Skip state files and checkpoints
    if (
      filePath === ".agent/optimize-state.json" ||
      filePath === ".agent/ratchet-state.json"
    )
      return;
    if (
      filePath.startsWith(".agent/checkpoints/") ||
      filePath.startsWith(".agent/artifacts/")
    )
      return;

    // Stage target
    if (filePath === state.target) {
      filesToStage.push(filePath);
      return;
    }

    // Stage other modified source files
    if (statusCode.includes("M")) {
      if (!filePath.startsWith(".agent/") && !filePath.startsWith(".codex/")) {
        filesToStage.push(filePath);
      }
      return;
    }

    // Stage untracked source files
    if (statusCode.includes("?")) {
      const ext = path.extname(filePath);
      const allowedExtensions = [
        ".js",
        ".ts",
        ".mjs",
        ".json",
        ".md",
        ".yml",
        ".yaml",
      ];
      const isSourceFile = allowedExtensions.includes(ext);
      const isTempDir =
        filePath.startsWith("tmp/") ||
        filePath.startsWith(".tmp/") ||
        filePath.startsWith("coverage/") ||
        filePath.startsWith("node_modules/") ||
        filePath.startsWith(".agent/") ||
        filePath.startsWith(".codex/");
      if (isSourceFile && !isTempDir) {
        filesToStage.push(filePath);
      }
    }
  });

  if (filesToStage.length > 0) {
    filesToStage.forEach((file) => runCmdArgs("git", ["add", file]));
  }
  const commitMsg = `optimize: improve ${path.basename(state.target)} metric from ${state.bestMetric} to ${metric}`;
  const commitRes = runCmd(`git commit -m "${commitMsg}"`);

  if (commitRes.status !== 0) {
    log(`Commit failed: ${commitRes.stderr}`, "error");
    runCmd("git reset --hard");
    printJson({ status: "failed", reason: "commit_failed" });
    return;
  }

  // Get new commit hash
  const hashRes = runCmd("git rev-parse HEAD");
  const commitHash = hashRes.stdout.trim();

  state.bestMetric = metric;
  state.history.push({
    timestamp: new Date().toISOString(),
    metric,
    commit: commitHash,
  });

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  log(`New benchmark record committed: ${metric}`, "success");
  printJson({ status: "accepted", improved: true, metric, commit: commitHash });
}

function finish() {
  if (!fs.existsSync(STATE_FILE)) {
    log("No active optimization session found.", "error");
    process.exit(1);
  }

  const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  const hasImprovements = state.history.length > 1;

  log("Finishing optimization session...", "info");

  // Block if there are uncommitted / unevaluated changes in the working tree
  const statusRes = runCmd("git status --porcelain -uall");
  const dirtyLines = statusRes.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      const filePath = line.substring(2).trim();
      // Only ignore state files and internal checkpoints/artifacts
      if (
        filePath === ".agent/optimize-state.json" ||
        filePath === ".agent/ratchet-state.json"
      )
        return false;
      if (
        filePath.startsWith(".agent/checkpoints/") ||
        filePath.startsWith(".agent/artifacts/")
      )
        return false;
      return true;
    });

  if (dirtyLines.length > 0) {
    log(
      "Cannot finish. You have uncommitted / unevaluated changes in the working tree:",
      "error",
    );
    dirtyLines.forEach((line) => console.log(`  ${line}`));
    log(
      "Please run 'evaluate' to test/commit them, or 'git reset --hard' to discard them before finishing.",
      "error",
    );
    process.exit(1);
  }

  // Checkout back to original branch
  log(`Switching back to original branch: ${state.originalBranch}`, "info");
  const checkoutRes = runCmd(`git checkout ${state.originalBranch}`);
  if (checkoutRes.status !== 0) {
    log(
      `Failed to switch back to original branch: ${checkoutRes.stderr}`,
      "error",
    );
    process.exit(1);
  }

  if (hasImprovements) {
    log(
      `Merging improvements from ${state.tempBranch} into ${state.originalBranch}...`,
      "info",
    );
    const mergeRes = runCmd(`git merge --ff-only ${state.tempBranch}`);
    if (mergeRes.status !== 0) {
      log(
        `Fast-forward merge failed: ${mergeRes.stderr}. Trying normal merge...`,
        "warning",
      );
      const normalMergeRes = runCmd(`git merge --no-edit ${state.tempBranch}`);
      if (normalMergeRes.status !== 0) {
        log(
          `Merge failed. Please resolve conflicts manually. Temporary branch is kept at: ${state.tempBranch}`,
          "error",
        );
        process.exit(1);
      }
    }
    log("Successfully merged optimizations!", "success");
  } else {
    log("No improvements recorded during this session.", "warning");
  }

  // Clean up branch
  log(`Deleting temporary branch: ${state.tempBranch}`, "info");
  runCmd(`git branch -D ${state.tempBranch}`);

  // Delete state file
  fs.unlinkSync(STATE_FILE);

  log("Optimization session completed and cleaned up.", "success");
  printJson({
    status: "completed",
    improvements: hasImprovements,
    baseline: state.baselineMetric,
    best: state.bestMetric,
    improvementRatio:
      state.baselineMetric !== 0
        ? (
            (Math.abs(state.baselineMetric - state.bestMetric) /
              state.baselineMetric) *
            100
          ).toFixed(2) + "%"
        : "N/A",
    history: state.history,
  });
}

// Command parser
function parseArgs() {
  const args = {};
  const rawArgs = process.argv.slice(3);
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const nextVal = rawArgs[i + 1];
      if (nextVal && !nextVal.startsWith("--")) {
        args[key] = nextVal;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

const command = process.argv[2];
const parsedArgs = parseArgs();

switch (command) {
  case "init":
    init(parsedArgs);
    break;
  case "evaluate":
  case "eval":
    evaluate();
    break;
  case "finish":
    finish();
    break;
  default:
    console.log(`
Git-based Code Optimizer

Usage:
  node scripts/maintenance/optimize.mjs init --target <file> --run-cmd <cmd> --metric-pattern <regex> [--direction lower|higher] [--test-cmd <cmd>]
  node scripts/maintenance/optimize.mjs evaluate
  node scripts/maintenance/optimize.mjs finish
`);
    process.exit(1);
}
