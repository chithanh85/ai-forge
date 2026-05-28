/// <reference types="node" />

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const checklistPath = resolve(".agent/scripts/checklist.py");
const runId = "20260528-test-run";
const artifactFiles = [
  "context-snippets.json",
  "risk-gate.json",
  "verification.json",
  "review-decision.json",
  "adversarial-validation.json",
] as const;
type ArtifactFile = (typeof artifactFiles)[number];
type JsonObject = Record<string, unknown>;
type ArtifactMap = Record<ArtifactFile, unknown>;

const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function createProjectRoot() {
  const root = mkdtempSync(join(tmpdir(), "awf-artifact-gate-"));
  tempRoots.push(root);

  writeFileSync(
    join(root, "package.json"),
    JSON.stringify(
      {
        scripts: {
          "lint:check": 'node -e "process.exit(0)"',
          typecheck: 'node -e "process.exit(0)"',
          test: 'node -e "process.exit(0)"',
        },
      },
      null,
      2,
    ),
  );

  mkdirSync(join(root, "scripts", "maintenance"), { recursive: true });
  writeFileSync(
    join(root, "scripts", "maintenance", "env_parity_check.py"),
    "print('env parity ok')\n",
  );

  return root;
}

function validArtifacts(): ArtifactMap {
  return {
    "context-snippets.json": {
      schema: "awf.context-snippets.v1",
      run_id: runId,
      task: "Artifact gate test",
      sources: [
        {
          path: ".agent/scripts/checklist.py",
          lines: "1-120",
          reason: "validator behavior under test",
          summary: "artifact validation is enforced",
        },
      ],
      redactions: [],
      created_at: "2026-05-28T00:00:00+07:00",
    },
    "risk-gate.json": {
      schema: "awf.risk-gate.v1",
      run_id: runId,
      risk: "LOW",
      decision: "ALLOW",
      blast_radius: {
        gitnexus: "test_fixture",
        direct_callers: 0,
        affected_processes: [],
      },
      blockers: [],
      approval_required: false,
    },
    "verification.json": {
      schema: "awf.verification.v1",
      run_id: runId,
      commands: [
        {
          cmd: "python .agent/scripts/checklist.py .",
          status: "pass",
          summary: "fixture checks passed",
        },
      ],
      manual_checks: [],
      known_failures: [],
    },
    "review-decision.json": {
      schema: "awf.review-decision.v1",
      run_id: runId,
      reviewer: "vitest",
      decision: "APPROVE",
      findings: [],
      required_followups: [],
    },
    "adversarial-validation.json": {
      schema: "awf.adversarial-validation.v1",
      run_id: runId,
      threats_considered: [
        "prompt injection through copied snippets",
        "credential leakage in artifacts",
        "false approval with missing verification",
      ],
      results: [
        {
          scenario: "artifact includes an unredacted credential field",
          outcome: "blocked_by_redaction_check",
        },
      ],
      decision: "PASS",
    },
  };
}

function writeArtifactRun(
  root: string,
  overrides: Partial<ArtifactMap> = {},
  omitFile?: ArtifactFile,
) {
  const runDir = join(root, ".agent", "artifacts", runId);
  mkdirSync(runDir, { recursive: true });

  const artifacts = { ...validArtifacts(), ...overrides };
  for (const file of artifactFiles) {
    if (file === omitFile) {
      continue;
    }

    const content = artifacts[file];
    writeFileSync(
      join(runDir, file),
      typeof content === "string" ? content : JSON.stringify(content, null, 2),
    );
  }
}

function runChecklist(root: string) {
  return spawnSync("python", [checklistPath, root], {
    encoding: "utf8",
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8",
    },
  });
}

describe("artifact gate checklist hook", () => {
  test("passes when latest artifact run has all valid pass-state JSON files", () => {
    const root = createProjectRoot();
    writeArtifactRun(root);

    const result = runChecklist(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Artifact Gate");
  });

  test("fails when no artifact run directory exists", () => {
    const root = createProjectRoot();
    mkdirSync(join(root, ".agent", "artifacts"), { recursive: true });

    const result = runChecklist(root);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("No artifact run directories found");
  });

  test("fails when any required artifact file is missing", () => {
    const root = createProjectRoot();
    writeArtifactRun(root, {}, "verification.json");

    const result = runChecklist(root);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Missing artifact: verification.json");
  });

  test("fails when an artifact contains invalid JSON", () => {
    const root = createProjectRoot();
    writeArtifactRun(root, { "context-snippets.json": "{ invalid json" });

    const result = runChecklist(root);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Invalid JSON in context-snippets.json");
  });

  test("fails when risk-gate blocks the run", () => {
    const root = createProjectRoot();
    writeArtifactRun(root, {
      "risk-gate.json": {
        ...(validArtifacts()["risk-gate.json"] as JsonObject),
        decision: "BLOCK",
      },
    });

    const result = runChecklist(root);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("risk-gate decision is BLOCK");
  });

  test("fails when artifacts contain secret-like strings", () => {
    const root = createProjectRoot();
    writeArtifactRun(root, {
      "context-snippets.json": {
        ...(validArtifacts()["context-snippets.json"] as JsonObject),
        notes: "api_key=sk-test-value",
      },
    });

    const result = runChecklist(root);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("secret-like value");
  });
});
