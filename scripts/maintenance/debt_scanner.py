#!/usr/bin/env python3
"""
Technical Debt Scanner & Ledger Generator for AI Forge / AWF Enterprise.
Scans the repository for debt markers (TODO, FIXME, HACK, MOCK, TEMP_BYPASS, DEBT)
and generates a structured markdown ledger and JSON report.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# Force UTF-8 on Windows terminal
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

DEFAULT_EXCLUDES = {
    ".git",
    ".venv",
    "venv",
    "node_modules",
    "__pycache__",
    ".pytest_cache",
    ".ruff_cache",
    ".next",
    "dist",
    "build",
    "artifacts",
    "coverage",
    ".turbo",
    ".gitnexus",
}

DEFAULT_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".mjs",
    ".cjs",
    ".go",
    ".rs",
    ".java",
    ".cpp",
    ".c",
    ".h",
    ".hpp",
    ".cs",
    ".php",
    ".sh",
    ".ps1",
    ".sql",
    ".md",
    ".yaml",
    ".yml",
    ".json",
}

DEBT_TAGS = {
    "FIXME:": {"severity": "HIGH", "weight": 3},
    "HACK:": {"severity": "HIGH", "weight": 3},
    "TEMP_BYPASS:": {"severity": "HIGH", "weight": 3},
    "TODO:": {"severity": "MEDIUM", "weight": 2},
    "MOCK:": {"severity": "LOW", "weight": 1},
    "DEBT:": {"severity": "MEDIUM", "weight": 2},
    "wsr-debt:": {"severity": "MEDIUM", "weight": 2},
}


def parse_line(line: str, rel_path: str, line_no: int, is_md: bool) -> list[dict]:
    findings = []
    # In markdown, ignore links/headers that casually mention keywords unless formatted as a comment/task
    for tag_str, meta in DEBT_TAGS.items():
        idx = line.find(tag_str)
        if idx != -1:
            content = line[idx + len(tag_str) :].strip()
            # Escape markdown pipes
            clean_content = content.replace("|", "\\|")
            
            # Extract owner if specified: @owner, [owner], (owner)
            owner = "Unassigned"
            owner_match = re.search(r"(?:@|\[|\()([a-zA-Z0-9_\-]+)(?:\]|\))?", content)
            if owner_match:
                candidate = owner_match.group(1)
                # Ignore common words matching parenthesis
                if candidate.lower() not in {"high", "medium", "low", "p0", "p1", "p2", "p3", "bug", "refactor"}:
                    owner = candidate

            findings.append({
                "file": rel_path.replace("\\", "/"),
                "line": line_no,
                "tag": tag_str.rstrip(":"),
                "severity": meta["severity"],
                "weight": meta["weight"],
                "owner": owner,
                "content": clean_content,
            })
    return findings


def scan_file(filepath: Path, repo_root: Path) -> list[dict]:
    rel_path = filepath.relative_to(repo_root)
    findings = []
    is_md = filepath.suffix.lower() == ".md"
    in_code_block = False

    try:
        with filepath.open("r", encoding="utf-8", errors="ignore") as f:
            for line_no, line in enumerate(f, 1):
                if is_md:
                    if line.strip().startswith("```"):
                        in_code_block = not in_code_block
                        continue
                    if in_code_block:
                        continue
                    # Skip markdown table borders
                    if set(line.strip()).issubset({"-", "|", ":", " "}):
                        continue
                    # Strip inline code spans to avoid documentation false positives
                    line = re.sub(r"`[^`]+`", " ", line)

                parsed = parse_line(line, str(rel_path), line_no, is_md)
                findings.extend(parsed)
    except Exception as e:
        print(f"Warning: Could not read {filepath}: {e}", file=sys.stderr)

    return findings


def scan_repo(repo_root: Path, excludes: set[str], extensions: set[str]) -> list[dict]:
    all_findings = []
    for root, dirs, files in os.walk(repo_root):
        # Modify dirs in place to skip excluded directories
        dirs[:] = [d for d in dirs if d not in excludes and not d.startswith(".")]
        for file in files:
            file_path = Path(root) / file
            if file_path.suffix.lower() in extensions:
                # Skip the ledger file itself and the debt scanner script to prevent false positives
                if file.lower() in {"debt_ledger.md", "debt_ledger.json", "debt_scanner.py"}:
                    continue
                file_findings = scan_file(file_path, repo_root)
                all_findings.extend(file_findings)
    return all_findings


def generate_markdown_ledger(findings: list[dict], output_file: Path) -> None:
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    high_count = sum(1 for f in findings if f["severity"] == "HIGH")
    med_count = sum(1 for f in findings if f["severity"] == "MEDIUM")
    low_count = sum(1 for f in findings if f["severity"] == "LOW")
    total_debt_score = sum(f["weight"] for f in findings)

    content = [
        "# 📋 Technical Debt Ledger",
        "",
        f"> Last updated: **{now_str}** | Total Debt Score: **{total_debt_score}**",
        "",
        "### 📊 Summary",
        f"- 🔴 **High Severity (FIXME / HACK / BYPASS):** {high_count}",
        f"- 🟡 **Medium Severity (TODO / DEBT):** {med_count}",
        f"- 🔵 **Low Severity (MOCK / NOTES):** {low_count}",
        f"- 📦 **Total Items:** {len(findings)}",
        "",
        "---",
        "",
        "### 📝 Debt Registry",
        "",
        "| Severity | Tag | Location | Owner | Description |",
        "| :--- | :--- | :--- | :--- | :--- |",
    ]

    if not findings:
        content.append("| None | - | - | - | ✨ No technical debt markers found! |")
    else:
        # Sort by Severity (High first), then file path
        severity_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        sorted_findings = sorted(findings, key=lambda x: (severity_order.get(x["severity"], 99), x["file"], x["line"]))
        for item in sorted_findings:
            sev_badge = "🔴 `HIGH`" if item["severity"] == "HIGH" else ("🟡 `MED`" if item["severity"] == "MEDIUM" else "🔵 `LOW`")
            loc_link = f"[{item['file']}:{item['line']}](../../{item['file']}#L{item['line']})" if output_file.parent.name == "docs" else f"[{item['file']}:{item['line']}]({item['file']}#L{item['line']})"
            content.append(
                f"| {sev_badge} | `{item['tag']}` | {loc_link} | `{item['owner']}` | {item['content']} |"
            )

    content.append("")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text("\n".join(content), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Scan technical debt markers and maintain debt ledger.")
    parser.add_argument("--root", default=".", help="Root directory to scan (default: current dir)")
    parser.add_argument("--output", default="docs/DEBT_LEDGER.md", help="Output Markdown ledger path")
    parser.add_argument("--json-output", default=None, help="Optional JSON output path")
    parser.add_argument("--strict", action="store_true", help="Fail with exit code 1 if HIGH severity debt is found")
    args = parser.parse_args()

    repo_root = Path(args.root).resolve()
    out_file = (repo_root / args.output).resolve()

    print(f"🔍 Scanning technical debt across {repo_root}...")
    findings = scan_repo(repo_root, DEFAULT_EXCLUDES, DEFAULT_EXTENSIONS)

    generate_markdown_ledger(findings, out_file)
    print(f"✅ Generated Technical Debt Ledger: {out_file}")

    if args.json_output:
        json_file = (repo_root / args.json_output).resolve()
        json_file.parent.mkdir(parents=True, exist_ok=True)
        json_file.write_text(json.dumps({"updated_at": datetime.now(timezone.utc).isoformat(), "total": len(findings), "items": findings}, indent=2), encoding="utf-8")
        print(f"✅ Generated JSON Ledger: {json_file}")

    unassigned_high = [f for f in findings if f["severity"] == "HIGH" and f["owner"] == "Unassigned"]
    high_items = [f for f in findings if f["severity"] == "HIGH"]

    if args.strict and unassigned_high:
        print(f"❌ Strict mode failure: Found {len(unassigned_high)} UNASSIGNED HIGH severity debt item(s).", file=sys.stderr)
        for item in unassigned_high:
            print(f"   - {item['file']}:{item['line']} [{item['tag']}] {item['content']}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
