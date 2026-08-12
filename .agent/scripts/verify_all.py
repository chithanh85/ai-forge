#!/usr/bin/env python3
"""
Full verification suite for AI Forge.
Usage: python .agent/scripts/verify_all.py
"""

import subprocess
import sys
import os

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("🚀 Starting full verification suite...")
    
    # Run the main checklist
    result = subprocess.run([sys.executable, ".agent/scripts/checklist.py", "."], capture_output=False)
    if result.returncode != 0:
        sys.exit(result.returncode)
        
    # Run the AI Agent Evals suite
    eval_script = os.path.join(os.path.dirname(__file__), "..", "evals", "run_evals.py")
    if os.path.exists(eval_script):
        print("\n🚀 Running AI Agent Evals Suite...")
        eval_res = subprocess.run([sys.executable, eval_script], capture_output=False)
        if eval_res.returncode != 0:
            print("❌ AI Agent Evals failed!")
            sys.exit(eval_res.returncode)

    print("\n✅ Verification complete! Codebase is healthy.")

if __name__ == "__main__":
    main()
