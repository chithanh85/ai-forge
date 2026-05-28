#!/usr/bin/env python3
"""
Wiki Lint - validates local wiki links.

Usage:
  python .agent/scripts/wiki_lint.py
  python .agent/scripts/wiki_lint.py --strict --json
  python .agent/scripts/wiki_lint.py --strict --changed
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

WIKI_DIR = Path("docs/wiki")
INDEX_FILE = Path("docs/wiki-index.md")
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]")
MARKDOWN_LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")


def normalized_display(path):
    return path.as_posix()


def collect_markdown_files():
    files = []
    if INDEX_FILE.exists():
        files.append(INDEX_FILE)
    if WIKI_DIR.exists():
        files.extend(sorted(WIKI_DIR.rglob("*.md")))
    return files


def staged_markdown_files(errors):
    result = subprocess.run(
        ["git", "diff", "--name-only", "--cached"],
        capture_output=True,
        encoding="utf-8",
        check=False,
    )
    if result.returncode != 0:
        errors.append(f"Unable to read staged files: {result.stderr.strip()}")
        return []

    files = []
    for raw_path in result.stdout.splitlines():
        path = Path(raw_path)
        normalized = path.as_posix()
        if normalized == INDEX_FILE.as_posix() or (
            normalized.startswith(f"{WIKI_DIR.as_posix()}/")
            and normalized.endswith(".md")
        ):
            if path.exists():
                files.append(path)
    return sorted(files)


def resolve_wikilink(link):
    target = link.strip().split("#", 1)[0].strip()
    if target.startswith("wiki/"):
        target = target[5:]
    target = target.strip("/")

    if not target:
        return WIKI_DIR.exists()

    if target.endswith("/"):
        return (WIKI_DIR / target.rstrip("/")).is_dir()

    candidate = WIKI_DIR / target
    if candidate.suffix != ".md":
        candidate = candidate.with_suffix(".md")
    if candidate.exists():
        return True

    if "/" not in target:
        return any(path.stem.lower() == target.lower() for path in WIKI_DIR.rglob("*.md"))

    return False


def markdown_target_path(raw_target):
    target = raw_target.strip()
    if " " in target and not target.startswith("<"):
        target = target.split(" ", 1)[0]
    target = target.strip("<>")
    target = target.split("#", 1)[0]
    return target


def is_external_link(target):
    lowered = target.lower()
    return (
        not target
        or lowered.startswith("http://")
        or lowered.startswith("https://")
        or lowered.startswith("mailto:")
        or lowered.startswith("tel:")
        or lowered.startswith("#")
    )


def validate_markdown_link(source_file, raw_target):
    target = markdown_target_path(raw_target)
    if is_external_link(target):
        return True

    return (source_file.parent / target).resolve().exists()


def lint_files(files, strict):
    errors = []
    warnings = []

    if not WIKI_DIR.exists():
        warnings.append("docs/wiki/ not found")
    elif not INDEX_FILE.exists() and not files:
        errors.append("docs/wiki-index.md not found")

    for md in files:
        if not md.exists():
            continue
        content = md.read_text(encoding="utf-8", errors="ignore")

        for link in WIKILINK_RE.findall(content):
            if not resolve_wikilink(link):
                warnings.append(
                    f"{normalized_display(md)}: broken wikilink [[{link}]]"
                )

        for link in MARKDOWN_LINK_RE.findall(content):
            if not validate_markdown_link(md, link):
                warnings.append(
                    f"{normalized_display(md)}: broken markdown link ({link})"
                )

    ok = not errors and (not strict or not warnings)
    return {
        "ok": ok,
        "strict": strict,
        "files": [normalized_display(path) for path in files],
        "pages": len(list(WIKI_DIR.rglob("*.md"))) if WIKI_DIR.exists() else 0,
        "errors": errors,
        "warnings": warnings,
    }


def print_text_report(result):
    print("\n📋 Wiki Lint Results")
    print(f"   Pages: {result['pages']}")
    print(f"   Files checked: {len(result['files'])}")

    if result["errors"]:
        print(f"\n   ❌ Errors ({len(result['errors'])}):")
        for error in result["errors"]:
            print(f"  ❌ {error}")

    if result["warnings"]:
        print(f"\n   ⚠️  Warnings ({len(result['warnings'])}):")
        for warning in result["warnings"][:20]:
            print(f"  ⚠️  {warning}")

    if result["ok"]:
        print("   ✅ All wiki links valid!")


def main():
    parser = argparse.ArgumentParser(description="Validate docs/wiki links")
    parser.add_argument("--strict", action="store_true", help="Fail on broken links")
    parser.add_argument(
        "--changed", action="store_true", help="Only check staged wiki markdown files"
    )
    parser.add_argument("--json", action="store_true", help="Emit JSON output")
    args = parser.parse_args()

    errors = []
    files = staged_markdown_files(errors) if args.changed else collect_markdown_files()
    result = lint_files(files, args.strict)
    result["errors"] = errors + result["errors"]
    result["ok"] = not result["errors"] and (not args.strict or not result["warnings"])

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print_text_report(result)

    sys.exit(0 if result["ok"] else 1)


if __name__ == "__main__":
    main()
