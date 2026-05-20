#!/usr/bin/env python3
"""
Verification checklist — Run before declaring any task done.
Usage: python .agent/scripts/checklist.py .
"""

import subprocess
import sys
import os

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def run_check(name, cmd):
    """Run a check and return (name, passed, output)."""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=60
        )
        passed = result.returncode == 0
        output = result.stdout.strip() or result.stderr.strip()
        return name, passed, output
    except subprocess.TimeoutExpired:
        return name, False, "TIMEOUT"
    except Exception as e:
        return name, False, str(e)

def main():
    project_root = sys.argv[1] if len(sys.argv) > 1 else "."
    os.chdir(project_root)

    checks = [
        ("Lint",      "npm run lint:check 2>&1"),
        ("TypeCheck", "npm run typecheck 2>&1"),
        ("Tests",     "npm run test 2>&1"),
        ("Env Parity","python scripts/maintenance/env_parity_check.py 2>&1"),
    ]

    print("\n🏥 AWF Enterprise Verification Checklist")
    print("=" * 50)

    passed_count = 0
    failed = []

    for name, cmd in checks:
        check_name, ok, output = run_check(name, cmd)
        status = "✅" if ok else "❌"
        print(f"  {status} {check_name}")
        if ok:
            passed_count += 1
        else:
            failed.append((check_name, output))

    print("=" * 50)
    total = len(checks)
    print(f"  Result: {passed_count}/{total} passed")

    if failed:
        print("\n  ❌ Failed checks:")
        for name, output in failed:
            print(f"    • {name}: {output[:200]}")
        sys.exit(1)
    else:
        print("\n  ✅ All checks passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()
