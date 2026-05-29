#!/usr/bin/env python3
"""
Hydrate split implementation plans.

Plans live at docs/plans/<slug>/ with:
- index.md
- phase-XX-*.md
- current-phase.txt
"""

import argparse
import json
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")


class HydrationError(Exception):
    """Raised when a plan cannot be hydrated."""


def resolve_plans_dir(raw_path):
    return Path(raw_path).resolve()


def get_plan_dir(plans_dir, slug):
    paths_to_check = [
        plans_dir / slug,
        plans_dir / "active" / slug,
        plans_dir / "completed" / slug,
        plans_dir / "backlog" / slug,
    ]
    for path in paths_to_check:
        plan_dir = path.resolve()
        if plans_dir not in plan_dir.parents and plan_dir != plans_dir:
            continue
        if plan_dir.is_dir() and (plan_dir / "index.md").is_file():
            return plan_dir
    raise HydrationError(f"Plan not found or missing index.md: {slug}")


def phase_files(plan_dir):
    return sorted(plan_dir.glob("phase-*.md"))


def read_active_phase(plan_dir):
    marker = plan_dir / "current-phase.txt"
    if marker.exists():
        active_name = marker.read_text(encoding="utf-8").strip()
        active_path = (plan_dir / active_name).resolve()
        if plan_dir not in active_path.parents:
            raise HydrationError("Active phase resolves outside plan directory")
        if active_path.is_file():
            return active_path
        raise HydrationError(f"Active phase not found: {active_name}")

    phases = phase_files(plan_dir)
    if not phases:
        raise HydrationError("No phase-*.md files found")
    return phases[0]


def list_plans(plans_dir):
    if not plans_dir.exists():
        return []
    plans = []
    # Check immediate subdirectories (backward compatibility)
    for path in plans_dir.iterdir():
        if path.is_dir() and (path / "index.md").is_file():
            plans.append(path.name)
    # Check subdirectories inside active, completed, backlog
    for sub in ["active", "completed", "backlog"]:
        subdir = plans_dir / sub
        if subdir.is_dir():
            for path in subdir.iterdir():
                if path.is_dir() and (path / "index.md").is_file():
                    plans.append(f"{sub}/{path.name}")
    return sorted(plans)


def cmd_list(args):
    plans = list_plans(resolve_plans_dir(args.plans_dir))
    if args.json:
        print(json.dumps({"plans": plans}, indent=2))
    else:
        for plan in plans:
            print(plan)


def cmd_active(args):
    plans_dir = resolve_plans_dir(args.plans_dir)
    plan_dir = get_plan_dir(plans_dir, args.slug)
    print(read_active_phase(plan_dir).name)


def cmd_set(args):
    plans_dir = resolve_plans_dir(args.plans_dir)
    plan_dir = get_plan_dir(plans_dir, args.slug)
    phase_path = (plan_dir / args.phase).resolve()
    if plan_dir not in phase_path.parents:
        raise HydrationError("Phase resolves outside plan directory")
    if not phase_path.is_file() or not phase_path.name.startswith("phase-"):
        raise HydrationError(f"Phase not found: {args.phase}")
    (plan_dir / "current-phase.txt").write_text(
        f"{phase_path.name}\n", encoding="utf-8"
    )
    print(phase_path.name)


def cmd_context(args):
    plans_dir = resolve_plans_dir(args.plans_dir)
    plan_dir = get_plan_dir(plans_dir, args.slug)
    active_phase = read_active_phase(plan_dir)
    index = (plan_dir / "index.md").read_text(encoding="utf-8")
    phase = active_phase.read_text(encoding="utf-8")

    print(f"# Hydrated Plan Context: {args.slug}")
    print()
    print(f"<!-- source: {plan_dir.relative_to(Path.cwd()) / 'index.md'} -->")
    print(index.rstrip())
    print()
    print(f"<!-- active-phase: {active_phase.name} -->")
    print(phase.rstrip())


def build_parser():
    parser = argparse.ArgumentParser(description="Hydrate split AWF plan context")
    parser.add_argument("--plans-dir", default="docs/plans")
    parser.add_argument("--json", action="store_true")

    subparsers = parser.add_subparsers(dest="command", required=True)

    list_parser = subparsers.add_parser("list", help="List split plan slugs")
    list_parser.set_defaults(func=cmd_list)

    active_parser = subparsers.add_parser("active", help="Show active phase")
    active_parser.add_argument("slug")
    active_parser.set_defaults(func=cmd_active)

    set_parser = subparsers.add_parser("set", help="Set active phase")
    set_parser.add_argument("slug")
    set_parser.add_argument("phase")
    set_parser.set_defaults(func=cmd_set)

    context_parser = subparsers.add_parser("context", help="Print active context")
    context_parser.add_argument("slug")
    context_parser.set_defaults(func=cmd_context)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    try:
        args.func(args)
    except HydrationError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
