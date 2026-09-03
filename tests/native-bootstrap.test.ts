import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const initScript = join(process.cwd(), "scripts", "awf", "init.mjs");
const doctorScript = join(process.cwd(), "scripts", "awf", "doctor.mjs");

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "awf-native-"));
  mkdirSync(join(root, ".planning"), { recursive: true });
  mkdirSync(join(root, ".codex"), { recursive: true });
  mkdirSync(join(root, ".awf"), { recursive: true });
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ name: "ai-forge", version: "1.0.0" }, null, 2) + "\n",
  );
  writeFileSync(join(root, "package-lock.json"), "{}\n");
  writeFileSync(
    join(root, ".planning", "PROJECT.md"),
    "# Project Overview\n\n## Name\n\n_Your project name_\n\n## Description\n\n_One-paragraph description of what this project does._\n",
  );
  writeFileSync(
    join(root, ".planning", "STATE.md"),
    "# Project State\n\nTemplate historical state that must not leak.\n",
  );
  writeFileSync(
    join(root, ".codex", "config.toml"),
    '[project]\nname = "{{AWF_PROJECT_NAME}}"\n',
  );
  writeFileSync(join(root, "AGENTS.md"), "# User agent rule\n");
  writeFileSync(join(root, "GEMINI.md"), "# User Gemini rule\n");
  writeFileSync(join(root, "CLAUDE.md"), "# User Claude rule\n");
  return root;
}

function run(root: string, name: string) {
  return spawnSync(
    process.execPath,
    [initScript, "--project-name", name, "--root", root],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
}

describe("AWF native bootstrap", () => {
  it("hydrates project identity, creates manifest, and resets template state", () => {
    const root = fixture();
    const result = run(root, "acme-api");
    expect(result.status, result.stderr || result.stdout).toBe(0);

    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    expect(pkg.name).toBe("acme-api");

    const manifest = JSON.parse(
      readFileSync(join(root, ".awf", "manifest.json"), "utf8"),
    );
    expect(manifest.schema_version).toBe(1);
    expect(manifest.project.name).toBe("acme-api");
    expect(manifest.toolchain.package_manager).toBe("npm");

    expect(readFileSync(join(root, ".codex", "config.toml"), "utf8")).toContain(
      'name = "acme-api"',
    );
    expect(
      readFileSync(join(root, ".planning", "PROJECT.md"), "utf8"),
    ).toContain("acme-api");
    expect(
      readFileSync(join(root, ".planning", "STATE.md"), "utf8"),
    ).not.toContain("Template historical state");
    const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
    expect(agents).toContain("<!-- awf:managed:start -->");
    expect(agents).toContain("# User agent rule");
  });

  it("anchors platform launchers to the template root and detects Python portably", () => {
    const ps = readFileSync(
      join(process.cwd(), "setup-enterprise.ps1"),
      "utf8",
    );
    const sh = readFileSync(join(process.cwd(), "setup-enterprise.sh"), "utf8");

    expect(ps).toContain("Set-Location -LiteralPath $PSScriptRoot");
    expect(ps).toContain("Get-Command python");
    expect(ps).toContain("Get-Command py");
    expect(ps).toContain(
      "& $PythonExe @PythonPrefixArgs .agent/scripts/checklist.py . --core",
    );
    expect(sh).toContain(
      'SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"',
    );
    expect(sh).toContain('cd "$SCRIPT_DIR"');
    expect(sh).toContain("command -v python3");
    expect(sh).toContain('"$PYTHON_BIN" .agent/scripts/checklist.py . --core');
  });

  it("preserves an existing repo package manager and is idempotent", () => {
    const root = fixture();
    writeFileSync(join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");

    const first = run(root, "existing-app");
    expect(first.status, first.stderr || first.stdout).toBe(0);
    const before = readFileSync(join(root, ".awf", "manifest.json"), "utf8");

    const second = run(root, "existing-app");
    expect(second.status, second.stderr || second.stdout).toBe(0);
    const after = readFileSync(join(root, ".awf", "manifest.json"), "utf8");

    expect(JSON.parse(after).toolchain.package_manager).toBe("pnpm");
    expect(after).toBe(before);
    const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
    expect(agents.match(/<!-- awf:managed:start -->/g)).toHaveLength(1);
    expect(agents).toContain("# User agent rule");

    const doctor = spawnSync(process.execPath, [doctorScript, "--root", root], {
      cwd: root,
      encoding: "utf8",
    });
    expect(doctor.status, doctor.stderr || doctor.stdout).toBe(0);
    expect(doctor.stdout).toContain("package-manager: pnpm");
  });
});
