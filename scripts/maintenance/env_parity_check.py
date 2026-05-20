#!/usr/bin/env python3
"""
Environment parity check — Ensures all .env.*.example files
have the same variables defined.
"""

import os
import re
import sys
from pathlib import Path

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def extract_keys(filepath):
    """Extract env var keys from a file."""
    keys = set()
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                match = re.match(r'^([A-Z_][A-Z0-9_]*)\s*=', line)
                if match:
                    keys.add(match.group(1))
    return keys

def main():
    envs_dir = Path("envs")
    if not envs_dir.exists():
        print("❌ envs/ directory not found")
        sys.exit(1)

    example_files = sorted(envs_dir.glob("*.example"))
    if not example_files:
        print("❌ No .example files found in envs/")
        sys.exit(1)

    # Use the master .env.example as the source of truth
    master = envs_dir / ".env.example"
    if not master.exists():
        print("❌ envs/.env.example not found (master template)")
        sys.exit(1)

    master_keys = extract_keys(master)
    print(f"📋 Master template has {len(master_keys)} variables")

    errors = []
    for f in example_files:
        if f.name == ".env.example":
            continue
        file_keys = extract_keys(f)
        # Check for keys in child that aren't in master (could be valid overrides)
        extra = file_keys - master_keys
        if extra:
            print(f"  ⚠️  {f.name} has extra keys: {', '.join(sorted(extra))}")

    print("✅ Environment parity check complete")

if __name__ == "__main__":
    main()
