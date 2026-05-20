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
        
    print("\n✅ Verification complete! Codebase is healthy.")

if __name__ == "__main__":
    main()
