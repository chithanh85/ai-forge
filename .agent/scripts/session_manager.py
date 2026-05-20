#!/usr/bin/env python3
"""
Session Manager — Save and restore AI session state.
Enables context handover between AI sessions.

Usage:
  python .agent/scripts/session_manager.py save
  python .agent/scripts/session_manager.py restore
"""

import json
import sys
from datetime import datetime
from pathlib import Path

STATE_FILE = Path(".planning/STATE.md")
SESSION_FILE = Path(".planning/session.json")

def save_session():
    """Save current session state."""
    session = {
        "timestamp": datetime.now().isoformat(),
        "state_exists": STATE_FILE.exists(),
    }

    if STATE_FILE.exists():
        session["state_content"] = STATE_FILE.read_text(encoding='utf-8')

    SESSION_FILE.write_text(json.dumps(session, indent=2, ensure_ascii=False))
    print(f"✅ Session saved at {session['timestamp']}")

def restore_session():
    """Restore previous session state."""
    if not SESSION_FILE.exists():
        print("📭 No previous session found")
        return

    session = json.loads(SESSION_FILE.read_text(encoding='utf-8'))
    print(f"📖 Last session: {session.get('timestamp', 'unknown')}")

    if STATE_FILE.exists():
        content = STATE_FILE.read_text(encoding='utf-8')
        print("\n--- Current State ---")
        print(content[:500])
    else:
        print("⚠️  No STATE.md found")

def main():
    if len(sys.argv) < 2:
        print("Usage: python session_manager.py <save|restore>")
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "save":
        save_session()
    elif cmd == "restore":
        restore_session()
    else:
        print(f"Unknown command: {cmd}")

if __name__ == "__main__":
    main()
