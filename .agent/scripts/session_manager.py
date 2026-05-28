#!/usr/bin/env python3
"""
Session Manager — Save and restore AI session state.
Enables context handover between AI sessions.

Usage:
  python .agent/scripts/session_manager.py save
  python .agent/scripts/session_manager.py restore
  python .agent/scripts/session_manager.py checkpoint init ...
  python .agent/scripts/session_manager.py checkpoint event ...
  python .agent/scripts/session_manager.py checkpoint command ...
  python .agent/scripts/session_manager.py checkpoint status ...
  python .agent/scripts/session_manager.py checkpoint show ...
"""

import json
import re
import sys
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, Union, List, Dict, Any

STATE_FILE = Path(".planning/STATE.md")
SESSION_FILE = Path(".planning/session.json")

class CheckpointError(Exception):
    """Raised when checkpoint loading, validation, or updating fails."""
    pass

def now_iso() -> str:
    """Return timezone-aware ISO timestamp."""
    return datetime.now().astimezone().isoformat()

def validate_run_id(run_id: str) -> str:
    """Allow only [A-Za-z0-9._-]; reject path traversal and empty values."""
    if not run_id:
        raise CheckpointError("Run ID cannot be empty.")
    if not re.match(r"^[A-Za-z0-9._-]+$", run_id):
        raise CheckpointError(f"Invalid Run ID format: '{run_id}'. Only alphanumeric, '.', '_', and '-' allowed.")
    return run_id

def checkpoint_dir(project_root: Path, run_id: str) -> Path:
    """Return .agent/checkpoints/<run-id> after validating run id is path-safe."""
    valid_id = validate_run_id(run_id)
    return project_root / ".agent" / "checkpoints" / valid_id

def default_checkpoint_file(project_root: Path, run_id: str) -> Path:
    """Return .agent/checkpoints/<run-id>/checkpoint.json."""
    return checkpoint_dir(project_root, run_id) / "checkpoint.json"

def build_checkpoint(
    run_id: str,
    task_title: str,
    agent_id: str,
    agent_role: str,
    project_root: Path,
    plan_slug: Optional[str] = None,
    active_phase: Optional[str] = None,
    worktree_enabled: bool = False,
    worktree_path: Optional[str] = None,
    worktree_branch: Optional[str] = None,
    cleanup_policy: str = "never",
    artifact_run_id: Optional[str] = None,
    allowed_files: Optional[List[str]] = None,
    forbidden_files: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Build schema-valid initial checkpoint with state.status = "initialized"."""
    validate_run_id(run_id)
    ts = now_iso()
    
    checkpoint = {
        "schema": "awf.session-checkpoint.v1",
        "version": 1,
        "run_id": run_id,
        "checkpoint_id": f"{run_id}:{agent_id}",
        "task": {
            "title": task_title,
            "request": task_title,
            "plan_slug": plan_slug or "",
            "active_phase": active_phase or ""
        },
        "agent": {
            "id": agent_id,
            "role": agent_role,
            "parent_run_id": run_id
        },
        "repo": {
            "root": str(project_root.resolve()).replace("\\", "/"),
            "base_ref": "HEAD",
            "base_sha": "",
            "dirty_policy": "block"
        },
        "worktree": {
            "enabled": worktree_enabled,
            "path": worktree_path or "",
            "branch": worktree_branch or "",
            "created": worktree_enabled,
            "cleanup": cleanup_policy
        },
        "artifacts": {
            "run_id": artifact_run_id or run_id,
            "dir": f".agent/artifacts/{artifact_run_id or run_id}",
            "required": [
                "context-snippets.json",
                "risk-gate.json",
                "verification.json",
                "review-decision.json",
                "adversarial-validation.json"
            ]
        },
        "state": {
            "status": "initialized",
            "current_step": "init",
            "summary": "Checkpoint initialized."
        },
        "todo": [],
        "events": [
            {
                "ts": ts,
                "type": "created",
                "message": "Checkpoint initialized",
                "data": {}
            }
        ],
        "commands": [],
        "files": {
            "allowed": allowed_files or [],
            "forbidden": forbidden_files or ["credentials/**", ".env", ".env.*"],
            "touched": []
        },
        "verification": {
            "last_result": "unknown",
            "commands": []
        },
        "timestamps": {
            "created_at": ts,
            "updated_at": ts
        }
    }
    return checkpoint

def validate_checkpoint(data: Dict[str, Any]) -> List[str]:
    """Check schema, required fields, status enums, command shape, and no forbidden env capture."""
    errors = []
    if not isinstance(data, dict):
        errors.append("Checkpoint must be a JSON object.")
        return errors

    if data.get("schema") != "awf.session-checkpoint.v1":
        errors.append("Invalid schema. Must be 'awf.session-checkpoint.v1'.")
    if data.get("version") != 1:
        errors.append("Invalid version. Must be 1.")
    
    for field in ["run_id", "checkpoint_id", "task", "agent", "repo", "worktree", "state", "timestamps"]:
        if field not in data:
            errors.append(f"Missing required top-level field: '{field}'.")

    # Validate state status
    allowed_statuses = {"initialized", "running", "blocked", "failed", "completed", "abandoned"}
    status = data.get("state", {}).get("status") if isinstance(data.get("state"), dict) else None
    if status not in allowed_statuses:
        errors.append(f"Invalid status: '{status}'. Must be one of {allowed_statuses}.")

    # Validate commands
    commands = data.get("commands", [])
    if not isinstance(commands, list):
        errors.append("Field 'commands' must be a list.")
    else:
        allowed_cmd_statuses = {"pass", "fail", "skipped"}
        for i, cmd_info in enumerate(commands):
            if not isinstance(cmd_info, dict):
                errors.append(f"Command at index {i} must be an object.")
                continue
            cmd_status = cmd_info.get("status")
            if cmd_status not in allowed_cmd_statuses:
                errors.append(f"Invalid status in command {i}: '{cmd_status}'. Must be one of {allowed_cmd_statuses}.")
            if "cmd" not in cmd_info or not isinstance(cmd_info["cmd"], list):
                errors.append(f"Missing or invalid 'cmd' array in command {i}.")

    return errors

def load_checkpoint(path: Path) -> Dict[str, Any]:
    """Read JSON object; raise CheckpointError on missing/invalid data."""
    if not path.exists():
        raise CheckpointError(f"Checkpoint file does not exist: '{path}'")
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except Exception as e:
        raise CheckpointError(f"Failed to parse checkpoint JSON: {e}")
    
    errors = validate_checkpoint(data)
    if errors:
        raise CheckpointError(f"Checkpoint validation failed: {'; '.join(errors)}")
    return data

def write_checkpoint_atomic(path: Path, data: Dict[str, Any]) -> None:
    """Create parent dirs, write checkpoint.tmp, replace checkpoint.json."""
    errors = validate_checkpoint(data)
    if errors:
        raise CheckpointError(f"Cannot write invalid checkpoint: {'; '.join(errors)}")
        
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(".tmp")
    try:
        tmp_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
        if path.exists():
            path.unlink()
        tmp_path.rename(path)
    except Exception as e:
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except:
                pass
        raise CheckpointError(f"Atomic write failed: {e}")

def update_checkpoint(path: Path, patch: Dict[str, Any]) -> Dict[str, Any]:
    """Load, merge allowed top-level fields, update timestamps.updated_at, write."""
    data = load_checkpoint(path)
    
    allowed_patch_fields = {"task", "agent", "repo", "worktree", "state", "todo", "files", "verification"}
    for key, val in patch.items():
        if key in allowed_patch_fields:
            if isinstance(data.get(key), dict) and isinstance(val, dict):
                data[key].update(val)
            else:
                data[key] = val
        else:
            if key in {"run_id", "schema", "version"}:
                continue
            data[key] = val

    data["timestamps"]["updated_at"] = now_iso()
    write_checkpoint_atomic(path, data)
    return data

def append_event(path: Path, event_type: str, message: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Append event and write."""
    checkpoint_data = load_checkpoint(path)
    event = {
        "ts": now_iso(),
        "type": event_type,
        "message": message,
        "data": data or {}
    }
    checkpoint_data.setdefault("events", []).append(event)
    checkpoint_data["timestamps"]["updated_at"] = now_iso()
    write_checkpoint_atomic(path, checkpoint_data)
    return checkpoint_data

def record_command(path: Path, cmd: List[str], cwd: str, status: str, exit_code: int, duration_ms: int, summary: str) -> Dict[str, Any]:
    """Append command, update verification last result if relevant."""
    checkpoint_data = load_checkpoint(path)
    cmd_info = {
        "ts": now_iso(),
        "cmd": cmd,
        "cwd": cwd,
        "status": status,
        "exit_code": exit_code,
        "duration_ms": duration_ms,
        "summary": summary
    }
    checkpoint_data.setdefault("commands", []).append(cmd_info)
    
    if any("test" in arg or "verify" in arg for arg in cmd):
        checkpoint_data["verification"]["last_result"] = "pass" if status == "pass" else "fail"
        
    checkpoint_data["timestamps"]["updated_at"] = now_iso()
    write_checkpoint_atomic(path, checkpoint_data)
    return checkpoint_data

def mark_status(path: Path, status: str, summary: Optional[str] = None, current_step: Optional[str] = None) -> Dict[str, Any]:
    """Update state status, summary, and current step."""
    patch: Dict[str, Any] = {"state": {"status": status}}
    if summary is not None:
        patch["state"]["summary"] = summary
    if current_step is not None:
        patch["state"]["current_step"] = current_step
    return update_checkpoint(path, patch)

def render_summary(data: Dict[str, Any]) -> str:
    """Human-readable summary for show and handoff."""
    task_info = data.get("task", {})
    agent_info = data.get("agent", {})
    state_info = data.get("state", {})
    worktree_info = data.get("worktree", {})
    timestamps = data.get("timestamps", {})
    
    events_count = len(data.get("events", []))
    commands_count = len(data.get("commands", []))
    
    lines = [
        f"AWF Run ID: {data.get('run_id')}",
        f"Checkpoint ID: {data.get('checkpoint_id')}",
        f"Status: {state_info.get('status')} | Step: {state_info.get('current_step')}",
        f"Task: {task_info.get('title')}",
        f"Agent: {agent_info.get('id')} ({agent_info.get('role')})",
        f"Worktree: {'Enabled (' + worktree_info.get('path') + ')' if worktree_info.get('enabled') else 'Disabled'}",
        f"Events: {events_count} | Commands: {commands_count}",
        f"Updated: {timestamps.get('updated_at')}",
        f"Summary: {state_info.get('summary')}"
    ]
    return "\n".join(lines)

def save_session():
    """Save current session state (original CLI wrapper)."""
    session = {
        "timestamp": datetime.now().isoformat(),
        "state_exists": STATE_FILE.exists(),
    }

    if STATE_FILE.exists():
        session["state_content"] = STATE_FILE.read_text(encoding='utf-8')

    SESSION_FILE.write_text(json.dumps(session, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"✅ Session saved at {session['timestamp']}")

def restore_session():
    """Restore previous session state (original CLI wrapper)."""
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

def handle_checkpoint_cli():
    """Parse checkpoint commands manually or with argparse."""
    parser = argparse.ArgumentParser(description="AWF Session Checkpoint CLI")
    subparsers = parser.add_subparsers(dest="subcommand", required=True)
    
    init_parser = subparsers.add_parser("init")
    init_parser.add_argument("--run-id", required=True)
    init_parser.add_argument("--task", required=True)
    init_parser.add_argument("--agent-id", required=True)
    init_parser.add_argument("--agent-role", required=True)
    init_parser.add_argument("--plan-slug", default=None)
    init_parser.add_argument("--worktree-path", default=None)
    init_parser.add_argument("--worktree-branch", default=None)
    init_parser.add_argument("--cleanup", default="never")
    init_parser.add_argument("--artifact-run-id", default=None)
    
    event_parser = subparsers.add_parser("event")
    event_parser.add_argument("--file", required=True)
    event_parser.add_argument("--type", required=True)
    event_parser.add_argument("--message", required=True)
    event_parser.add_argument("--data-json", default=None)
    
    cmd_parser = subparsers.add_parser("command")
    cmd_parser.add_argument("--file", required=True)
    cmd_parser.add_argument("--cmd-json", required=True)
    cmd_parser.add_argument("--status", required=True)
    cmd_parser.add_argument("--exit-code", type=int, required=True)
    cmd_parser.add_argument("--duration-ms", type=int, required=True)
    cmd_parser.add_argument("--summary", required=True)
    
    status_parser = subparsers.add_parser("status")
    status_parser.add_argument("--file", required=True)
    status_parser.add_argument("--status", required=True)
    status_parser.add_argument("--summary", default=None)
    status_parser.add_argument("--step", default=None)
    
    show_parser = subparsers.add_parser("show")
    show_parser.add_argument("--file", required=True)
    
    args = parser.parse_args(sys.argv[2:])
    
    try:
        if args.subcommand == "init":
            project_root = Path(".")
            file_path = default_checkpoint_file(project_root, args.run_id)
            
            checkpoint = build_checkpoint(
                run_id=args.run_id,
                task_title=args.task,
                agent_id=args.agent_id,
                agent_role=args.agent_role,
                project_root=project_root,
                plan_slug=args.plan_slug,
                worktree_enabled=bool(args.worktree_path),
                worktree_path=args.worktree_path,
                worktree_branch=args.worktree_branch,
                cleanup_policy=args.cleanup,
                artifact_run_id=args.artifact_run_id
            )
            write_checkpoint_atomic(file_path, checkpoint)
            print(f"✅ Initialized checkpoint: {file_path}")
            
        elif args.subcommand == "event":
            data = None
            if args.data_json:
                data = json.loads(args.data_json)
            file_path = Path(args.file)
            append_event(file_path, args.type, args.message, data)
            print("✅ Event recorded")
            
        elif args.subcommand == "command":
            cmd_list = json.loads(args.cmd_json)
            file_path = Path(args.file)
            record_command(
                file_path,
                cmd=cmd_list,
                cwd="",
                status=args.status,
                exit_code=args.exit_code,
                duration_ms=args.duration_ms,
                summary=args.summary
            )
            print("✅ Command recorded")
            
        elif args.subcommand == "status":
            file_path = Path(args.file)
            mark_status(file_path, args.status, args.summary, args.step)
            print("✅ Status updated")
            
        elif args.subcommand == "show":
            file_path = Path(args.file)
            data = load_checkpoint(file_path)
            print(render_summary(data))
            
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python session_manager.py <save|restore|checkpoint>")
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "save":
        save_session()
    elif cmd == "restore":
        restore_session()
    elif cmd == "checkpoint":
        global argparse
        import argparse
        handle_checkpoint_cli()
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)

if __name__ == "__main__":
    main()
