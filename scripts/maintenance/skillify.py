#!/usr/bin/env python3
"""
Bulk-update all SKILL.md files to add contextual wrapper.
Adds project-aware context loading and cross-references to static skills.

Usage: python scripts/maintenance/skillify.py
"""
import re
from pathlib import Path

SKILL_DIR = Path(".agent/skills")
ALREADY_DYNAMIC = {
    "system-design", "database-design", "api-patterns",
    "testing-patterns", "vulnerability-scanner",
    "deployment-procedures", "brainstorming", "plan-writing",
}

CONTEXT_BLOCK = """
---

## 🔴 MANDATORY: Context Loading (Auto-injected)

Before applying this skill, load project context:
1. Read `ARCHITECTURE.md` or `CODEBASE_INDEX.md` — understand current system
2. Check related existing code — `grep` for patterns this skill covers
3. Read `.planning/STATE.md` — understand current project phase
4. `recall()` from Second Brain — past lessons in this domain

> **RULE:** Never apply skill knowledge without checking what the project already does.
> **RULE:** Consistency with existing code > theoretical perfection.

"""

def needs_update(content):
    return "MANDATORY: Context Loading" not in content

def inject_context(content):
    # Find the end of the frontmatter + first heading
    # Insert context block after the first paragraph/description
    lines = content.split('\n')
    insert_after = 0
    found_heading = False
    for i, line in enumerate(lines):
        if line.startswith('# ') and not found_heading:
            found_heading = True
            # Find next blank line or next heading
            for j in range(i+1, min(i+10, len(lines))):
                if lines[j].strip() == '' or lines[j].startswith('#'):
                    insert_after = j
                    break
            break

    if insert_after == 0:
        insert_after = len(lines)

    lines.insert(insert_after, CONTEXT_BLOCK)
    return '\n'.join(lines)

def main():
    updated = 0
    skipped = 0

    for skill_dir in sorted(SKILL_DIR.iterdir()):
        if not skill_dir.is_dir():
            continue
        if skill_dir.name in ALREADY_DYNAMIC:
            skipped += 1
            continue

        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            continue

        content = skill_md.read_text(encoding='utf-8')
        if needs_update(content):
            new_content = inject_context(content)
            skill_md.write_text(new_content, encoding='utf-8')
            updated += 1
            print(f"  ✅ Updated: {skill_dir.name}")
        else:
            skipped += 1
            print(f"  ⏭️  Already dynamic: {skill_dir.name}")

    print(f"\n📊 Results: {updated} updated, {skipped} skipped")

if __name__ == "__main__":
    main()
