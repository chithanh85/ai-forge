/// <reference types="node" />

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const checklistPath = resolve(".agent/scripts/checklist.py");
const runId = "20260528-review-gate-test";
const artifactFiles = [
  "context-snippets.json",
  "risk-gate.json",
  "verification.json",
  "review-decision.json",
  "adversarial-validation.json",
] as const;
type ArtifactFile = (typeof artifactFiles)[number];
type ArtifactMap = Record<ArtifactFile, unknown>;

const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function createProjectRoot() {
  const root = mkdtempSync(join(tmpdir(), "awf-plan-review-gate-"));
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
  mkdirSync(join(root, "docs", "wiki"), { recursive: true });
  writeFileSync(join(root, "docs", "wiki-index.md"), "# Wiki\n");

  return root;
}

function validArtifacts(): ArtifactMap {
  return {
    "context-snippets.json": {
      schema: "awf.context-snippets.v1",
      run_id: runId,
      task: "Plan review gate test",
      sources: [
        {
          path: ".agent/workflows/review-plan.md",
          lines: "1-120",
          reason: "review pipeline behavior under test",
          summary: "review scores are enforced",
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
      reviewer: "review-plan",
      decision: "APPROVE",
      reviewers: [
        {
          name: "architecture-reviewer",
          decision: "APPROVE",
          score: 4,
          findings: [],
        },
        {
          name: "experience-reviewer",
          decision: "APPROVE",
          score: 4,
          findings: [],
        },
      ],
      findings: [],
      required_followups: [],
    },
    "adversarial-validation.json": {
      schema: "awf.adversarial-validation.v1",
      run_id: runId,
      threats_considered: ["false approval with weak review"],
      rationalization_checks: [
        {
          excuse: "This review is good enough",
          rebuttal: "Scores and BLOCK decisions must be explicit.",
          outcome: "passed",
        },
      ],
      results: [
        {
          scenario: "reviewer score below threshold",
          outcome: "blocked_by_review_gate",
        },
      ],
      decision: "PASS",
    },
  };
}

function writeArtifactRun(root: string, overrides: Partial<ArtifactMap> = {}) {
  const runDir = join(root, ".agent", "artifacts", runId);
  mkdirSync(runDir, { recursive: true });

  const artifacts = { ...validArtifacts(), ...overrides };
  for (const file of artifactFiles) {
    writeFileSync(join(runDir, file), JSON.stringify(artifacts[file], null, 2));
  }
}

function runChecklist(root: string) {
  const cleanEnv = { ...process.env };
  delete cleanEnv.AWF_ARTIFACT_RUN_ID;
  return spawnSync("python", [checklistPath, root], {
    encoding: "utf8",
    env: {
      ...cleanEnv,
      PYTHONIOENCODING: "utf-8",
    },
  });
}

describe("plan review gate", () => {
  test("passes when every reviewer approves with score 3 or higher", () => {
    const root = createProjectRoot();
    writeArtifactRun(root);

    const result = runChecklist(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Artifact Gate");
  });

  test("fails when any reviewer score is below 3", () => {
    const root = createProjectRoot();
    writeArtifactRun(root, {
      "review-decision.json": {
        ...(validArtifacts()["review-decision.json"] as Record<
          string,
          unknown
        >),
        reviewers: [
          {
            name: "architecture-reviewer",
            decision: "APPROVE",
            score: 2,
            findings: ["missing deployment rollback"],
          },
        ],
      },
    });

    const result = runChecklist(root);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("architecture-reviewer score 2 is below 3");
  });

  test("fails when any reviewer blocks the plan", () => {
    const root = createProjectRoot();
    writeArtifactRun(root, {
      "review-decision.json": {
        ...(validArtifacts()["review-decision.json"] as Record<
          string,
          unknown
        >),
        reviewers: [
          {
            name: "experience-reviewer",
            decision: "BLOCK",
            score: 4,
            findings: ["acceptance flow is not testable"],
          },
        ],
      },
    });

    const result = runChecklist(root);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("experience-reviewer decision is BLOCK");
  });
});
