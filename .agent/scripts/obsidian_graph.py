#!/usr/bin/env python3
"""
Obsidian Knowledge Graph Scanner
Scans docs/wiki/ for concepts and their relationships.

Usage:
  python .agent/scripts/obsidian_graph.py info <concept>
  python .agent/scripts/obsidian_graph.py list
  python .agent/scripts/obsidian_graph.py search <query>
"""

import os
import re
import sys
from pathlib import Path

WIKI_DIR = Path("docs/wiki")
DOCS_DIR = Path("docs")

def find_wikilinks(content):
    """Extract [[wikilinks]] from markdown content."""
    return re.findall(r'\[\[([^\]]+)\]\]', content)

def scan_wiki():
    """Scan all wiki files and build a graph."""
    graph = {}
    if not WIKI_DIR.exists():
        return graph

    for md in WIKI_DIR.rglob("*.md"):
        rel = md.relative_to(DOCS_DIR)
        content = md.read_text(encoding='utf-8', errors='ignore')
        links = find_wikilinks(content)
        graph[str(rel)] = {
            "path": str(md),
            "links": links,
            "title": md.stem,
            "size": len(content),
        }
    return graph

def cmd_info(concept):
    """Show info about a concept and related docs."""
    graph = scan_wiki()
    found = []
    for path, info in graph.items():
        if concept.lower() in info["title"].lower():
            found.append(info)
        elif concept.lower() in ' '.join(info["links"]).lower():
            found.append(info)

    if found:
        print(f"📖 Found {len(found)} docs related to '{concept}':")
        for f in found:
            print(f"  • {f['title']} ({f['path']})")
            if f['links']:
                print(f"    Links to: {', '.join(f['links'][:5])}")
    else:
        print(f"❌ No docs found for '{concept}'")
        print("   Run `/brainstorm` or create a wiki page first.")

def cmd_list():
    """List all wiki pages."""
    graph = scan_wiki()
    if not graph:
        print("📭 Wiki is empty. Start adding pages to docs/wiki/")
        return
    print(f"📚 Wiki has {len(graph)} pages:")
    for path, info in sorted(graph.items()):
        link_count = len(info['links'])
        print(f"  • {info['title']} ({link_count} links)")

def cmd_search(query):
    """Search wiki content."""
    results = []
    if not WIKI_DIR.exists():
        print("📭 Wiki directory not found")
        return

    for md in WIKI_DIR.rglob("*.md"):
        content = md.read_text(encoding='utf-8', errors='ignore')
        if query.lower() in content.lower():
            # Find the line containing the match
            for i, line in enumerate(content.split('\n'), 1):
                if query.lower() in line.lower():
                    results.append((md, i, line.strip()))
                    break

    if results:
        print(f"🔍 Found {len(results)} matches for '{query}':")
        for path, line_num, line in results[:10]:
            print(f"  • {path.name}:{line_num} — {line[:80]}")
    else:
        print(f"❌ No matches for '{query}'")

def main():
    if len(sys.argv) < 2:
        print("Usage: python obsidian_graph.py <info|list|search> [args]")
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "info" and len(sys.argv) > 2:
        cmd_info(sys.argv[2])
    elif cmd == "list":
        cmd_list()
    elif cmd == "search" and len(sys.argv) > 2:
        cmd_search(sys.argv[2])
    else:
        print("Usage: python obsidian_graph.py <info|list|search> [args]")

if __name__ == "__main__":
    main()
