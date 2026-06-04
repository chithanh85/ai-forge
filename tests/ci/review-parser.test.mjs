import { describe, it, expect } from "vitest";
import {
  parseReviewJSON,
  mapToDownstreamSeverity,
  sanitizeMarkdown,
  shouldCreateIssue,
  parseIssueBody,
  validateFilePath,
  escapeXmlDelimiters,
} from "../../scripts/ci/helpers/review-parser.mjs";

describe("review-parser.mjs", () => {
  describe("sanitizeMarkdown", () => {
    it("should strip markdown code block markers", () => {
      const input = "const x = 5;\n```\nconsole.log(x);\n```";
      const output = sanitizeMarkdown(input);
      expect(output).not.toContain("```");
      expect(output).toContain("// (fenced code block marker stripped)");
    });

    it("should return empty string for non-string input", () => {
      expect(sanitizeMarkdown(null)).toBe("");
      expect(sanitizeMarkdown(undefined)).toBe("");
      expect(sanitizeMarkdown(123)).toBe("");
    });
  });

  describe("parseReviewJSON with strict validation", () => {
    it("should parse valid clean JSON string", () => {
      const input = JSON.stringify({
        findings: [
          {
            severity: "BLOCKING",
            category: "security",
            line: 10,
            message: "SQL Injection",
          },
        ],
      });
      const result = parseReviewJSON(input);
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0].severity).toBe("BLOCKING");
      expect(result.error).toBe(false);
    });

    it("should normalize severity and category uppercase/lowercase if they are valid", () => {
      const input = JSON.stringify({
        findings: [
          {
            severity: "blocking",
            category: "SECURITY",
            line: 10,
            message: "lowercase test",
          },
        ],
      });
      const result = parseReviewJSON(input);
      expect(result.findings[0].severity).toBe("BLOCKING");
      expect(result.findings[0].category).toBe("security");
      expect(result.error).toBe(false);
    });

    it("should enforce length limits on strings", () => {
      const longMessage = "a".repeat(1500);
      const longFix = "b".repeat(2500);
      const input = JSON.stringify({
        findings: [
          {
            severity: "BLOCKING",
            category: "security",
            line: 10,
            message: longMessage,
            suggestedFix: longFix,
          },
        ],
      });
      const result = parseReviewJSON(input);
      expect(result.findings[0].message).toHaveLength(1000);
      expect(result.findings[0].suggestedFix).toHaveLength(2000);
    });

    it("should set error flag to true for invalid severity values (Strict check)", () => {
      const input = JSON.stringify({
        findings: [
          {
            severity: "CRITICAL",
            category: "security",
            line: 10,
            message: "invalid severity",
          },
        ],
      });
      const result = parseReviewJSON(input);
      expect(result.findings).toEqual([]);
      expect(result.error).toBe(true);
    });

    it("should set error flag to true for invalid category values (Strict check)", () => {
      const input = JSON.stringify({
        findings: [
          {
            severity: "BLOCKING",
            category: "database",
            line: 10,
            message: "invalid category",
          },
        ],
      });
      const result = parseReviewJSON(input);
      expect(result.findings).toEqual([]);
      expect(result.error).toBe(true);
    });

    it("should set error flag to true for empty or non-string message", () => {
      const input1 = JSON.stringify({
        findings: [
          { severity: "BLOCKING", category: "security", line: 10, message: "" },
        ],
      });
      const input2 = JSON.stringify({
        findings: [
          {
            severity: "BLOCKING",
            category: "security",
            line: 10,
            message: 123,
          },
        ],
      });
      expect(parseReviewJSON(input1).error).toBe(true);
      expect(parseReviewJSON(input2).error).toBe(true);
    });

    it("should set error flag to true for malformed JSON", () => {
      const input = '{ findings: [{ severity: "BLOCKING" ';
      const result = parseReviewJSON(input);
      expect(result.findings).toEqual([]);
      expect(result.error).toBe(true);
    });

    it("should set error flag to true for null/invalid input types", () => {
      expect(parseReviewJSON(null).error).toBe(true);
      expect(parseReviewJSON(undefined).error).toBe(true);
      expect(parseReviewJSON(123).error).toBe(true);
    });
  });

  describe("mapToDownstreamSeverity", () => {
    it("should return null for non-BLOCKING findings", () => {
      const finding = { severity: "SUGGESTION", category: "performance" };
      expect(mapToDownstreamSeverity(finding)).toBeNull();
    });

    it("should map BLOCKING security finding to security", () => {
      const finding = { severity: "BLOCKING", category: "security" };
      expect(mapToDownstreamSeverity(finding)).toBe("security");
    });

    it("should map BLOCKING bug finding to critical", () => {
      const finding = { severity: "BLOCKING", category: "bug" };
      expect(mapToDownstreamSeverity(finding)).toBe("critical");
    });
  });

  describe("shouldCreateIssue policy helper", () => {
    const blockingFinding = { severity: "BLOCKING", category: "security" };
    const nitFinding = { severity: "NIT", category: "style" };

    it("should return true for BLOCKING internal PR with issue creation enabled", () => {
      expect(
        shouldCreateIssue(blockingFinding, false, true, "dev1", null),
      ).toBe(true);
    });

    it("should return false if PR is from external fork", () => {
      expect(shouldCreateIssue(blockingFinding, true, true, "dev1", null)).toBe(
        false,
      );
    });

    it("should return false if issue creation is disabled", () => {
      expect(
        shouldCreateIssue(blockingFinding, false, false, "dev1", null),
      ).toBe(false);
    });

    it("should return false for non-BLOCKING findings", () => {
      expect(shouldCreateIssue(nitFinding, false, true, "dev1", null)).toBe(
        false,
      );
    });

    it("should apply actor whitelist filter correctly", () => {
      const trusted = "admin1, admin2, github-actions[bot]";
      expect(
        shouldCreateIssue(blockingFinding, false, true, "admin1", trusted),
      ).toBe(true);
      expect(
        shouldCreateIssue(
          blockingFinding,
          false,
          true,
          "github-actions[bot]",
          trusted,
        ),
      ).toBe(true);
      expect(
        shouldCreateIssue(blockingFinding, false, true, "hacker1", trusted),
      ).toBe(false);
    });
  });

  describe("parseIssueBody", () => {
    it("should parse file, severity, finding and diff from issue body markdown", () => {
      const body = `
Some issue header details.
\`\`\`yaml
file: src/auth.js
severity: BLOCKING
\`\`\`

### Finding
This is a security risk of SQL injection.

### Proposed Fix
Run parameterization.

\`\`\`diff
- old_code();
+ new_code();
\`\`\`
`;
      const result = parseIssueBody(body);
      expect(result.file).toBe("src/auth.js");
      expect(result.severity).toBe("BLOCKING");
      expect(result.finding).toBe("This is a security risk of SQL injection.");
      expect(result.diffContext).toBe("- old_code();\n+ new_code();");
    });

    it("should return empty fields for empty/null inputs", () => {
      const result = parseIssueBody(null);
      expect(result.file).toBeNull();
      expect(result.finding).toBe("");
    });
  });

  describe("validateFilePath", () => {
    const mockCwd = "D:/Project/awf-enterprise-template";

    it("should allow safe relative paths under cwd", () => {
      expect(validateFilePath("src/auth.js", mockCwd)).toBe(true);
      expect(validateFilePath("package.json", mockCwd)).toBe(true);
      expect(validateFilePath("tests/plan.test.ts", mockCwd)).toBe(true);
    });

    it("should reject absolute paths", () => {
      expect(validateFilePath("/etc/passwd", mockCwd)).toBe(false);
      expect(validateFilePath("C:/Windows/System32", mockCwd)).toBe(false);
      expect(validateFilePath("\\\\server\\share", mockCwd)).toBe(false);
    });

    it("should reject directory traversal attempts", () => {
      expect(validateFilePath("src/../../etc/passwd", mockCwd)).toBe(false);
      expect(validateFilePath("../unrelated-folder", mockCwd)).toBe(false);
      expect(validateFilePath("..", mockCwd)).toBe(false);
    });

    it("should reject path resolving outside CWD", () => {
      expect(
        validateFilePath("src/../../F2FSimple/package.json", mockCwd),
      ).toBe(false);
    });

    it("should reject control characters", () => {
      expect(validateFilePath("src/auth.js\0", mockCwd)).toBe(false);
      expect(validateFilePath("src/auth.js\n", mockCwd)).toBe(false);
    });
  });

  describe("escapeXmlDelimiters", () => {
    it("should escape closing tags of finding_data and diff_data", () => {
      const input = "some text with </finding_data> and </diff_data> tags.";
      expect(escapeXmlDelimiters(input)).toBe(
        "some text with &lt;/finding_data&gt; and &lt;/diff_data&gt; tags.",
      );
    });

    it("should return empty string for non-string inputs", () => {
      expect(escapeXmlDelimiters(null)).toBe("");
      expect(escapeXmlDelimiters(undefined)).toBe("");
    });
  });
});
