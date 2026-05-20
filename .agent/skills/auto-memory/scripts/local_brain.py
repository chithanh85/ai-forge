#!/usr/bin/env python3
"""
Local Second Brain — File-based fallback when MCP is not configured.

Usage:
  python .agent/skills/auto-memory/scripts/local_brain.py remember "topic" "detail" --tags tag1 tag2
  python .agent/skills/auto-memory/scripts/local_brain.py recall "search query"
  python .agent/skills/auto-memory/scripts/local_brain.py recent [--limit 10]
  python .agent/skills/auto-memory/scripts/local_brain.py stats
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BRAIN_DIR = Path("docs/wiki/lessons")
INDEX_FILE = Path("docs/wiki-index.md")


def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:60]


def remember(topic, detail, tags=None, entry_type="lesson", related_files=None):
    """Save a memory entry to local brain."""
    BRAIN_DIR.mkdir(parents=True, exist_ok=True)

    now = datetime.now()
    slug = slugify(topic)
    filename = f"{now.strftime('%Y%m%d')}-{slug}.md"
    filepath = BRAIN_DIR / filename

    tags = tags or []
    related = related_files or []

    content = f"""# {entry_type.title()}: {topic}
**Date:** {now.isoformat()}
**Type:** {entry_type}
**Tags:** {' '.join(f'#{t}' for t in tags)}

## Summary
{topic}

## Detail
{detail}

## Related Files
{chr(10).join(f'- `{f}`' for f in related) if related else '- (none)'}
"""

    filepath.write_text(content, encoding='utf-8')
    _update_index(filename, topic, entry_type, tags)
    print(f"Saved: {filepath}")
    return filepath


def recall(query, limit=5):
    """Search memories by keyword matching."""
    if not BRAIN_DIR.exists():
        print("No memories yet. Brain directory doesn't exist.")
        return []

    query_lower = query.lower()
    query_words = set(query_lower.split())
    results = []

    for f in sorted(BRAIN_DIR.glob("*.md"), reverse=True):
        try:
            content = f.read_text(encoding='utf-8')
            content_lower = content.lower()

            # Score by word matches
            score = 0
            for word in query_words:
                if word in content_lower:
                    score += content_lower.count(word)

            if score > 0:
                # Extract summary line
                summary = ""
                for line in content.split('\n'):
                    if line.startswith('# '):
                        summary = line[2:].strip()
                        break

                results.append({
                    'file': str(f),
                    'summary': summary,
                    'score': score,
                    'date': f.stem[:8]
                })
        except Exception:
            pass

    results.sort(key=lambda x: x['score'], reverse=True)
    results = results[:limit]

    if results:
        print(f"Found {len(results)} relevant memories for '{query}':\n")
        for i, r in enumerate(results, 1):
            print(f"  {i}. [{r['date']}] {r['summary']} (score: {r['score']})")
            print(f"     File: {r['file']}")
    else:
        print(f"No memories found for '{query}'")

    return results


def recent(limit=10):
    """Show recent memories."""
    if not BRAIN_DIR.exists():
        print("No memories yet.")
        return

    files = sorted(BRAIN_DIR.glob("*.md"), reverse=True)[:limit]
    print(f"Recent {len(files)} memories:\n")
    for f in files:
        try:
            content = f.read_text(encoding='utf-8')
            summary = ""
            entry_type = "unknown"
            for line in content.split('\n'):
                if line.startswith('# '):
                    summary = line[2:].strip()
                if line.startswith('**Type:**'):
                    entry_type = line.split(':**')[1].strip()
            date = f.stem[:8]
            print(f"  [{date}] [{entry_type}] {summary}")
        except Exception:
            pass


def stats():
    """Show brain statistics."""
    if not BRAIN_DIR.exists():
        print("No memories yet.")
        return

    files = list(BRAIN_DIR.glob("*.md"))
    types = {}
    tags = {}

    for f in files:
        try:
            content = f.read_text(encoding='utf-8')
            for line in content.split('\n'):
                if line.startswith('**Type:**'):
                    t = line.split(':**')[1].strip()
                    types[t] = types.get(t, 0) + 1
                if line.startswith('**Tags:**'):
                    for tag in re.findall(r'#(\w+)', line):
                        tags[tag] = tags.get(tag, 0) + 1
        except Exception:
            pass

    total_size = sum(f.stat().st_size for f in files)
    print(f"Brain Statistics:")
    print(f"  Total memories: {len(files)}")
    print(f"  Total size: {total_size / 1024:.1f} KB")
    print(f"\n  By type:")
    for t, c in sorted(types.items(), key=lambda x: -x[1]):
        print(f"    {t}: {c}")
    print(f"\n  Top tags:")
    for t, c in sorted(tags.items(), key=lambda x: -x[1])[:10]:
        print(f"    #{t}: {c}")


def _update_index(filename, topic, entry_type, tags):
    """Add entry to wiki index."""
    INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)

    index_entry = f"- [{topic}](lessons/{filename}) — {entry_type} — {', '.join(f'#{t}' for t in tags)}\n"

    if INDEX_FILE.exists():
        content = INDEX_FILE.read_text(encoding='utf-8')
        if "## Lessons" not in content:
            content += "\n\n## Lessons\n\n"
        content = content.replace("## Lessons\n", f"## Lessons\n{index_entry}", 1)
        INDEX_FILE.write_text(content, encoding='utf-8')
    else:
        INDEX_FILE.write_text(f"# Wiki Index\n\n## Lessons\n{index_entry}", encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description="Local Second Brain")
    subparsers = parser.add_subparsers(dest="command")

    # remember
    p_remember = subparsers.add_parser("remember")
    p_remember.add_argument("topic", help="What to remember")
    p_remember.add_argument("detail", help="Details/explanation")
    p_remember.add_argument("--tags", nargs="*", default=[], help="Tags")
    p_remember.add_argument("--type", default="lesson", help="lesson|decision|incident|pattern")
    p_remember.add_argument("--files", nargs="*", default=[], help="Related files")

    # recall
    p_recall = subparsers.add_parser("recall")
    p_recall.add_argument("query", help="Search query")
    p_recall.add_argument("--limit", type=int, default=5, help="Max results")

    # recent
    p_recent = subparsers.add_parser("recent")
    p_recent.add_argument("--limit", type=int, default=10, help="Max results")

    # stats
    subparsers.add_parser("stats")

    args = parser.parse_args()

    if args.command == "remember":
        remember(args.topic, args.detail, args.tags, args.type, args.files)
    elif args.command == "recall":
        recall(args.query, args.limit)
    elif args.command == "recent":
        recent(args.limit)
    elif args.command == "stats":
        stats()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
