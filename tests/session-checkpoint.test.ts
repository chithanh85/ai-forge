/// <reference types="node" />

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const sessionManagerPath = resolve(".agent/scripts/session_manager.py");
const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function createTempRoot() {
  const root = mkdtempSync(join(tmpdir(), "awf-checkpoint-test-"));
  tempRoots.push(root);
  return root;
}

function runSessionManager(root: string, args: string[]) {
  return spawnSync("python", [sessionManagerPath, ...args], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8",
    },
  });
}

describe("session checkpoint CLI", () => {
  test("Given checkpoint init, when required args are supplied, then checkpoint.json is created", () => {
    const root = createTempRoot();
    const runId = "test-run-123";

    const result = runSessionManager(root, [
      "checkpoint",
      "init",
      "--run-id",
      runId,
      "--task",
      "Build check",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
    ]);

    expect(result.status).toBe(0);

    const checkpointPath = join(
      root,
      ".agent",
      "checkpoints",
      runId,
      "checkpoint.json",
    );
    expect(existsSync(checkpointPath)).toBe(true);

    const data = JSON.parse(readFileSync(checkpointPath, "utf8"));
    expect(data.schema).toBe("awf.session-checkpoint.v1");
    expect(data.run_id).toBe(runId);
    expect(data.state.status).toBe("initialized");
    expect(data.task.title).toBe("Build check");
  });

  test("Given invalid run id, when init runs, then command exits non-zero and no file is created outside checkpoints", () => {
    const root = createTempRoot();

    // Attempt directory traversal in run-id
    const result = runSessionManager(root, [
      "checkpoint",
      "init",
      "--run-id",
      "../bad-dir",
      "--task",
      "Traversal",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
    ]);

    expect(result.status).not.toBe(0);
    const badPath = join(root, ".agent", "bad-dir");
    expect(existsSync(badPath)).toBe(false);
  });

  test("Given checkpoint event, when event is appended, then events length increments and timestamps updated_at changes", () => {
    const root = createTempRoot();
    const runId = "event-run";

    // 1. Init
    runSessionManager(root, [
      "checkpoint",
      "init",
      "--run-id",
      runId,
      "--task",
      "Event task",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
    ]);

    const checkpointPath = join(
      root,
      ".agent",
      "checkpoints",
      runId,
      "checkpoint.json",
    );
    const initialData = JSON.parse(readFileSync(checkpointPath, "utf8"));
    const initialUpdatedAt = initialData.timestamps.updated_at;

    // Wait briefly or modify to ensure timestamp would be newer or different if updated.
    // In Python, isoformat will have different microsecond or second part.

    // 2. Append event
    const eventResult = runSessionManager(root, [
      "checkpoint",
      "event",
      "--file",
      checkpointPath,
      "--type",
      "scout",
      "--message",
      "Found baseline code",
    ]);

    expect(eventResult.status).toBe(0);

    const updatedData = JSON.parse(readFileSync(checkpointPath, "utf8"));
    expect(updatedData.events.length).toBeGreaterThan(
      initialData.events.length,
    );
    expect(updatedData.events[updatedData.events.length - 1].type).toBe(
      "scout",
    );
    expect(updatedData.events[updatedData.events.length - 1].message).toBe(
      "Found baseline code",
    );
    expect(updatedData.timestamps.updated_at).not.toBe(initialUpdatedAt);
  });

  test("Given checkpoint command with status fail, when recorded, then command details are persisted", () => {
    const root = createTempRoot();
    const runId = "cmd-run";

    runSessionManager(root, [
      "checkpoint",
      "init",
      "--run-id",
      runId,
      "--task",
      "Cmd task",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
    ]);

    const checkpointPath = join(
      root,
      ".agent",
      "checkpoints",
      runId,
      "checkpoint.json",
    );

    const cmdResult = runSessionManager(root, [
      "checkpoint",
      "command",
      "--file",
      checkpointPath,
      "--cmd-json",
      '["pnpm", "test"]',
      "--status",
      "fail",
      "--exit-code",
      "1",
      "--duration-ms",
      "1230",
      "--summary",
      "Tests failed",
    ]);

    expect(cmdResult.status).toBe(0);

    const data = JSON.parse(readFileSync(checkpointPath, "utf8"));
    expect(data.commands.length).toBe(1);
    expect(data.commands[0].cmd).toEqual(["pnpm", "test"]);
    expect(data.commands[0].status).toBe("fail");
    expect(data.commands[0].exit_code).toBe(1);
    expect(data.commands[0].duration_ms).toBe(1230);
    expect(data.commands[0].summary).toBe("Tests failed");
  });

  test("Given invalid command status, when recorded, then validation fails", () => {
    const root = createTempRoot();
    const runId = "invalid-cmd-run";

    runSessionManager(root, [
      "checkpoint",
      "init",
      "--run-id",
      runId,
      "--task",
      "Cmd task",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
    ]);

    const checkpointPath = join(
      root,
      ".agent",
      "checkpoints",
      runId,
      "checkpoint.json",
    );

    const cmdResult = runSessionManager(root, [
      "checkpoint",
      "command",
      "--file",
      checkpointPath,
      "--cmd-json",
      '["pnpm", "test"]',
      "--status",
      "super-invalid-status",
      "--exit-code",
      "1",
      "--duration-ms",
      "1230",
      "--summary",
      "Tests failed",
    ]);

    expect(cmdResult.status).not.toBe(0);
  });

  test("Given checkpoint show, when checkpoint exists, then output includes run details", () => {
    const root = createTempRoot();
    const runId = "show-run";

    runSessionManager(root, [
      "checkpoint",
      "init",
      "--run-id",
      runId,
      "--task",
      "Show task",
      "--agent-id",
      "test-agent",
      "--agent-role",
      "worker",
    ]);

    const checkpointPath = join(
      root,
      ".agent",
      "checkpoints",
      runId,
      "checkpoint.json",
    );

    const showResult = runSessionManager(root, [
      "checkpoint",
      "show",
      "--file",
      checkpointPath,
    ]);

    expect(showResult.status).toBe(0);
    expect(showResult.stdout).toContain(runId);
    expect(showResult.stdout).toContain("initialized");
    expect(showResult.stdout).toContain("test-agent");
  });
});
