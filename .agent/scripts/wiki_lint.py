#!/usr/bin/env python3
"""
Wiki Lint — Validates docs/wiki/ markdown files.
Checks broken wikilinks, missing pages, and index consistency.

Usage: python .agent/scripts/wiki_lint.py
"""

import re
import sys
from pathlib import Path

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

WIKI_DIR = Path("docs/wiki")
INDEX_FILE = Path("docs/wiki-index.md")

def main():
    errors = []
    warnings = []

    if not WIKI_DIR.exists():
        print("⚠️  docs/wiki/ not found — creating skeleton")
        WIKI_DIR.mkdir(parents=True, exist_ok=True)
        return

    # Collect all wiki page stems
    all_pages = {md.stem.lower() for md in WIKI_DIR.rglob("*.md")}

    # Check each file for broken wikilinks
    for md in WIKI_DIR.rglob("*.md"):
        content = md.read_text(encoding='utf-8', errors='ignore')
        links = re.findall(r'\[\[([^\]|]+)', content)

        for link in links:
            # Normalize link
            link_stem = link.split('/')[-1].lower()
            if link_stem not in all_pages:
                warnings.append(f"  ⚠️  {md.name}: broken link [[{link}]]")

    # Check index file
    if INDEX_FILE.exists():
        index_content = INDEX_FILE.read_text(encoding='utf-8', errors='ignore')
        index_links = re.findall(r'\[\[([^\]]+)\]\]', index_content)
        for link in index_links:
            link_path = WIKI_DIR / f"{link.split('/')[-1]}.md"
            if not link_path.exists():
                # Try with subdirectories
                found = list(WIKI_DIR.rglob(f"{link.split('/')[-1]}.md"))
                if not found:
                    warnings.append(f"  ⚠️  wiki-index.md: references missing page [[{link}]]")
    else:
        errors.append("  ❌ docs/wiki-index.md not found")

    # Report
    print(f"\n📋 Wiki Lint Results")
    print(f"   Pages: {len(all_pages)}")

    if errors:
        print(f"\n   ❌ Errors ({len(errors)}):")
        for e in errors:
            print(e)

    if warnings:
        print(f"\n   ⚠️  Warnings ({len(warnings)}):")
        for w in warnings[:20]:
            print(w)

    if not errors and not warnings:
        print("   ✅ All wiki links valid!")

    sys.exit(1 if errors else 0)

if __name__ == "__main__":
    main()
