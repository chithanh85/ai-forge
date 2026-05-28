/// <reference types="node" />

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const rulePath = resolve(".agent/rules/rationalization-prevention.md");

function read(path: string) {
  return readFileSync(resolve(path), "utf8");
}

describe("rationalization prevention rule", () => {
  test("defines an excuse-rebuttal table for agents", () => {
    expect(existsSync(rulePath)).toBe(true);

    const content = readFileSync(rulePath, "utf8");

    expect(content).toContain("Excuse");
    expect(content).toContain("Rebuttal");
    expect(content).toMatch(/too simple/i);
    expect(content).toMatch(/test(s)? after/i);
    expect(content).toMatch(/manual/i);
  });

  test("is referenced by global rules and core workflows before code writing", () => {
    const requiredFiles = [
      "AGENTS.md",
      "CLAUDE.md",
      "GEMINI.md",
      ".agent/rules/GEMINI.md",
      ".agent/workflows/plan.md",
      ".agent/workflows/code.md",
      ".agent/workflows/debug.md",
    ];

    for (const file of requiredFiles) {
      const content = read(file);

      expect(content, `${file} should load the rationalization rule`).toContain(
        "rationalization-prevention",
      );
      expect(content, `${file} should require checking excuses`).toMatch(
        /rationalization/i,
      );
    }
  });

  test("adversarial validation schema requires rationalization checks", () => {
    const schema = JSON.parse(
      read(".agent/schemas/artifacts/adversarial-validation.schema.json"),
    ) as {
      required?: string[];
      properties?: Record<string, unknown>;
    };

    expect(schema.required).toContain("rationalization_checks");
    expect(schema.properties).toHaveProperty("rationalization_checks");
  });
});
