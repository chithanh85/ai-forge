import path from "path";

/**
 * review-parser.mjs
 * Pure functions to parse Gemini JSON output, sanitize input/output, and map severity levels.
 */

/**
 * Sanitizes Markdown block markers (backticks) to prevent Markdown Injection.
 * Replaces triple backticks with a safe representation.
 * @param {string} text
 * @returns {string} Sanitized text
 */
export function sanitizeMarkdown(text) {
  if (!text || typeof text !== "string") {
    return "";
  }
  return text.replace(/```/g, " // (fenced code block marker stripped)");
}

/**
 * Extracts and parses JSON from raw LLM output.
 * Performs strict schema validation, normalization, and size limits.
 * If validation fails for any finding, it triggers a fail-closed status.
 * @param {string} rawOutput
 * @returns {object} { findings: Array, error: boolean }
 */
export function parseReviewJSON(rawOutput) {
  if (!rawOutput || typeof rawOutput !== "string") {
    return { findings: [], error: true };
  }

  let cleanText = rawOutput.trim();

  // Strip markdown block markers if present
  if (cleanText.startsWith("```")) {
    const lines = cleanText.split("\n");
    if (lines[0].startsWith("```")) {
      lines.shift();
    }
    if (lines[lines.length - 1].startsWith("```")) {
      lines.pop();
    }
    cleanText = lines.join("\n").trim();
  }

  try {
    const parsed = JSON.parse(cleanText);
    if (!parsed || !Array.isArray(parsed.findings)) {
      return { findings: [], error: true };
    }

    const validSeverities = ["BLOCKING", "SUGGESTION", "NIT", "QUESTION"];
    const validCategories = ["security", "bug", "performance", "style"];
    const validatedFindings = [];

    for (const f of parsed.findings) {
      if (!f || typeof f !== "object") {
        return { findings: [], error: true };
      }

      const severity = (f.severity || "").toUpperCase();
      const category = (f.category || "").toLowerCase();

      // Strict Validation: Fail-closed on schema deviation
      if (!validSeverities.includes(severity)) {
        console.error(
          `⚠️ Strict Validation Failed: Invalid severity "${severity}"`,
        );
        return { findings: [], error: true };
      }
      if (!validCategories.includes(category)) {
        console.error(
          `⚠️ Strict Validation Failed: Invalid category "${category}"`,
        );
        return { findings: [], error: true };
      }
      if (typeof f.message !== "string" || f.message.trim().length === 0) {
        console.error(
          "⚠️ Strict Validation Failed: message field must be a non-empty string",
        );
        return { findings: [], error: true };
      }
      if (
        f.line !== undefined &&
        f.line !== null &&
        (typeof f.line !== "number" || isNaN(f.line))
      ) {
        console.error(
          `⚠️ Strict Validation Failed: Invalid line field value: ${f.line}`,
        );
        return { findings: [], error: true };
      }

      // Enforce safety limits on string fields
      const rawMessage = f.message.trim();
      const rawFix = typeof f.suggestedFix === "string" ? f.suggestedFix : "";

      validatedFindings.push({
        severity,
        category,
        line: f.line || null,
        message: sanitizeMarkdown(rawMessage.slice(0, 1000)),
        suggestedFix: sanitizeMarkdown(rawFix.slice(0, 2000)),
      });
    }

    return { findings: validatedFindings, error: false };
  } catch (err) {
    console.error("⚠️ Failed to parse LLM JSON output:", err.message);
    return { findings: [], error: true };
  }
}

/**
 * Maps structured review findings to downstream severity levels.
 * Only BLOCKING issues are mapped to create GitHub Issues.
 * @param {object} finding
 * @returns {string|null} Downstream severity ('security'|'critical'|'bug'|null)
 */
export function mapToDownstreamSeverity(finding) {
  if (!finding || finding.severity !== "BLOCKING") {
    return null;
  }

  const category = (finding.category || "").toLowerCase();

  if (category === "security") {
    return "security";
  }

  if (category === "bug") {
    return "critical";
  }

  return "bug";
}

/**
 * Determines whether a structured finding should trigger GitHub Issue creation.
 * Encapsulates security gates (fork check, actor whitelist) and severity requirements.
 * @param {object} finding
 * @param {boolean} isFork
 * @param {boolean} createIssuesEnabled
 * @param {string} actor
 * @param {string} trustedActors
 * @returns {boolean}
 */
export function shouldCreateIssue(
  finding,
  isFork,
  createIssuesEnabled,
  actor,
  trustedActors,
) {
  if (!createIssuesEnabled || isFork) {
    return false;
  }

  // Whitelist actor trust gate
  if (trustedActors && typeof trustedActors === "string") {
    const whitelist = trustedActors
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (whitelist.length > 0 && (!actor || !whitelist.includes(actor))) {
      console.log(
        `   🔒 Security Gate: Actor "${actor}" is not in the whitelist. Skipping auto-fix issue creation.`,
      );
      return false;
    }
  }

  return finding && finding.severity === "BLOCKING";
}

/**
 * Validates a file path to prevent absolute path access, path traversal, or accessing files outside CWD.
 * @param {string} file
 * @param {string} cwd Current working directory (defaults to process.cwd())
 * @returns {boolean} True if path is safe, false otherwise
 */
export function validateFilePath(file, cwd = process.cwd()) {
  if (typeof file !== "string" || !file.trim()) {
    return false;
  }

  // 1. Block control characters or null bytes (before trimming)
  if (/[\x00-\x1f\x7f]/.test(file)) {
    return false;
  }

  const trimmed = file.trim();

  // 2. Block absolute paths (starts with / or \ or C:)
  if (path.isAbsolute(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("\\") || /^[A-Za-z]:/.test(trimmed)) {
    return false;
  }

  // 3. Block directory traversal syntactically
  const normalized = path.normalize(trimmed);
  if (normalized.startsWith("..") || normalized.includes("..") || path.isAbsolute(normalized)) {
    return false;
  }

  // 4. Resolve relative to cwd and ensure it remains strictly inside cwd
  const resolvedPath = path.resolve(cwd, normalized);
  const resolvedCwd = path.resolve(cwd);

  if (resolvedPath === resolvedCwd) {
    return false; // CWD itself cannot be modified
  }
  
  // Ensure the resolvedPath starts with resolvedCwd + separator
  const separator = resolvedCwd.endsWith(path.sep) ? "" : path.sep;
  if (!resolvedPath.startsWith(resolvedCwd + separator)) {
    return false;
  }

  return true;
}

/**
 * Parses structured issue bodies to extract file, severity, finding description, and diff context.
 * @param {string} body
 * @returns {object} { file, severity, finding, diffContext }
 */
export function parseIssueBody(body) {
  const result = { file: null, severity: null, finding: "", diffContext: "" };
  if (typeof body !== "string") {
    return result;
  }

  const yamlMatch = body.match(/```yaml\n([\s\S]*?)```/);
  if (yamlMatch) {
    const yaml = yamlMatch[1];
    const fileMatch = yaml.match(/file:\s*(.+)/);
    const severityMatch = yaml.match(/severity:\s*(.+)/);
    if (fileMatch) result.file = fileMatch[1].trim();
    if (severityMatch) result.severity = severityMatch[1].trim();
  }

  const findingMatch = body.match(/### Finding\n([\s\S]*?)(?=### |---|$)/);
  if (findingMatch) result.finding = findingMatch[1].trim();

  const diffMatch = body.match(/```diff\n([\s\S]*?)```/);
  if (diffMatch) result.diffContext = diffMatch[1].trim();

  return result;
}
