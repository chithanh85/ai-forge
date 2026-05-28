#!/usr/bin/env python3
"""
Worktree Runner — Run agent commands in isolated git worktrees.
Enables safe parallel execution and runtime state tracking.

Usage:
  python .agent/scripts/worktree_runner.py run --run-id <id> --task <task> ... -- <command>
  python .agent/scripts/worktree_runner.py status --run-id <id>
  python .agent/scripts/worktree_runner.py cleanup --run-id <id> [--force]
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional, List, Dict, Any, Literal

# Import checkpoint API from session_manager
sys.path.append(str(Path(__file__).parent.resolve()))
import session_manager

@dataclass
class WorktreeInfo:
    path: str
    branch: str
    base_ref: str
    base_sha: str

def resolve_repo_root(start: Path = Path(".")) -> Path:
    """Use git rev-parse --show-toplevel to find the repository root."""
    try:
        res = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=start,
            capture_output=True,
            text=True,
            check=True
        )
        return Path(res.stdout.strip()).resolve()
    except Exception:
        # Fallback to starting directory
        return start.resolve()

def slugify_run_id(raw: str) -> str:
    """Convert invalid chars to -, reject empty/path traversal."""
    if not raw:
        raise ValueError("Run ID cannot be empty.")
    slug = re.sub(r"[^A-Za-z0-9._-]", "-", raw)
    if ".." in slug or "/" in slug or "\\" in slug:
        raise ValueError(f"Unsafe Run ID: {raw}")
    return slug

def validate_worktree_root(repo_root: Path, worktree_path: Path) -> Path:
    """Require worktree path to be under <repo>/.tmp/worktrees/."""
    resolved_repo = repo_root.resolve()
    resolved_wt = worktree_path.resolve()
    
    # Must be under <repo>/.tmp/worktrees/
    tmp_wt_root = resolved_repo / ".tmp" / "worktrees"
    
    # Check if resolved_wt starts with tmp_wt_root
    try:
        resolved_wt.relative_to(tmp_wt_root)
    except ValueError:
        raise ValueError(
            f"Unsafe worktree path: '{resolved_wt}'. "
            f"Must be located inside '{tmp_wt_root}'."
        )
    return resolved_wt

def run_git(repo_root: Path, args: List[str], check: bool = True) -> subprocess.CompletedProcess:
    """Run git command without shell."""
    return subprocess.run(
        ["git"] + args,
        cwd=repo_root,
        capture_output=True,
        text=True,
        check=check
    )

def git_status_porcelain(path: Path) -> List[str]:
    """Read git status --porcelain."""
    res = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=path,
        capture_output=True,
        text=True,
        check=True
    )
    lines = res.stdout.splitlines()
    # Filter out entries inside .tmp/ and .agent/checkpoints/ to be extremely safe, 
    # though they should be ignored by git anyway
    filtered = []
    for line in lines:
        if not line:
            continue
        # Format is usually ' M path/to/file'
        filepath = line[3:]
        if filepath.startswith(".tmp/") or filepath.startswith(".agent/checkpoints/"):
            continue
        filtered.append(line)
    return filtered

def ensure_base_allowed(repo_root: Path, allow_dirty: bool) -> None:
    """Block dirty canonical root unless allow_dirty is true."""
    status_lines = git_status_porcelain(repo_root)
    if status_lines and not allow_dirty:
        raise session_manager.CheckpointError(
            f"Canonical root is dirty! Blocked run to prevent conflicts. "
            f"Changes:\n" + "\n".join(status_lines[:10])
        )

def create_worktree(
    repo_root: Path,
    run_id: str,
    base_ref: str,
    worktree_root: Path,
    branch_name: Optional[str] = None
) -> WorktreeInfo:
    """Run git worktree add; refuse existing path by default."""
    if worktree_root.exists():
        raise session_manager.CheckpointError(
            f"Worktree path already exists: '{worktree_root}'"
        )
        
    actual_branch = branch_name or f"awf/{run_id}"
    
    # Get base SHA
    res_sha = run_git(repo_root, ["rev-parse", base_ref])
    base_sha = res_sha.stdout.strip()
    
    # Check if branch exists
    res_branch = subprocess.run(
        ["git", "show-ref", "--verify", f"refs/heads/{actual_branch}"],
        cwd=repo_root,
        capture_output=True
    )
    
    git_args = ["worktree", "add"]
    if res_branch.returncode == 0:
        # Branch exists, check out existing branch
        git_args += [str(worktree_root), actual_branch]
    else:
        # Branch does not exist, create new branch
        git_args += ["-b", actual_branch, str(worktree_root), base_ref]
        
    run_git(repo_root, git_args)
    
    return WorktreeInfo(
        path=str(worktree_root.resolve()).replace("\\", "/"),
        branch=actual_branch,
        base_ref=base_ref,
        base_sha=base_sha
    )

def remove_worktree(repo_root: Path, worktree_path: Path, force: bool = False) -> None:
    """Remove worktree using git worktree remove; never rm -rf directly."""
    args = ["worktree", "remove"]
    if force:
        args.append("--force")
    args.append(str(worktree_path))
    run_git(repo_root, args)

def run_agent_command(
    command: List[str],
    cwd: Path,
    env: Dict[str, str],
    timeout_sec: Optional[int] = None
) -> Dict[str, Any]:
    """Run command without shell; record duration and output tails."""
    start_time = time.time()
    try:
        res = subprocess.run(
            command,
            cwd=cwd,
            env=env,
            capture_output=True,
            text=True,
            timeout=timeout_sec
        )
        duration_ms = int((time.time() - start_time) * 1000)
        return {
            "exit_code": res.returncode,
            "duration_ms": duration_ms,
            "stdout": res.stdout,
            "stderr": res.stderr
        }
    except subprocess.TimeoutExpired as e:
        duration_ms = int((time.time() - start_time) * 1000)
        return {
            "exit_code": -1,
            "duration_ms": duration_ms,
            "stdout": e.stdout.decode() if e.stdout else "",
            "stderr": (e.stderr.decode() if e.stderr else "") + "\n[Command timed out]"
        }
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        return {
            "exit_code": -2,
            "duration_ms": duration_ms,
            "stdout": "",
            "stderr": f"Failed to execute command: {e}"
        }

def handle_run(args, cmd_list: List[str]) -> int:
    repo_root = resolve_repo_root()
    run_id = slugify_run_id(args.run_id)
    
    # 1. Resolve worktree path
    wt_root_dir = Path(args.worktree_root) if args.worktree_root else repo_root / ".tmp" / "worktrees"
    wt_path = wt_root_dir / run_id
    
    # Validate worktree root path is inside .tmp/worktrees/
    try:
        wt_path = validate_worktree_root(repo_root, wt_path)
    except ValueError as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        return 1

    checkpoint_file = session_manager.default_checkpoint_file(repo_root, run_id)
    
    # 2. Check base allowed
    try:
        ensure_base_allowed(repo_root, args.allow_dirty)
    except session_manager.CheckpointError as e:
        # Initialize a blocked checkpoint for auditing
        checkpoint = session_manager.build_checkpoint(
            run_id=run_id,
            task_title=args.task,
            agent_id=args.agent_id,
            agent_role=args.agent_role,
            project_root=repo_root,
            worktree_enabled=True,
            worktree_path=str(wt_path.resolve()).replace("\\", "/"),
            worktree_branch=f"awf/{run_id}",
            cleanup_policy=args.cleanup
        )
        checkpoint["state"]["status"] = "blocked"
        checkpoint["state"]["summary"] = str(e)
        session_manager.write_checkpoint_atomic(checkpoint_file, checkpoint)
        print(f"❌ Blocked: {e}", file=sys.stderr)
        return 1
        
    # 3. Create initial checkpoint
    checkpoint = session_manager.build_checkpoint(
        run_id=run_id,
        task_title=args.task,
        agent_id=args.agent_id,
        agent_role=args.agent_role,
        project_root=repo_root,
        worktree_enabled=True,
        worktree_path=str(wt_path.resolve()).replace("\\", "/"),
        worktree_branch=f"awf/{run_id}",
        cleanup_policy=args.cleanup
    )
    if args.allow_dirty:
        checkpoint["repo"]["dirty_policy"] = "allow"
        
    session_manager.write_checkpoint_atomic(checkpoint_file, checkpoint)
    session_manager.mark_status(checkpoint_file, "running", "Creating git worktree")
    
    # 4. Create git worktree
    try:
        wt_info = create_worktree(
            repo_root=repo_root,
            run_id=run_id,
            base_ref=args.base_ref,
            worktree_root=wt_path
        )
        session_manager.update_checkpoint(checkpoint_file, {
            "repo": {
                "base_sha": wt_info.base_sha
            },
            "worktree": {
                "created": True,
                "branch": wt_info.branch
            }
        })
        session_manager.append_event(
            checkpoint_file,
            "worktree_created",
            f"Worktree initialized at {wt_info.path} on branch {wt_info.branch}"
        )
    except Exception as e:
        session_manager.mark_status(checkpoint_file, "failed", f"Failed to create worktree: {e}")
        print(f"❌ Failed to create worktree: {e}", file=sys.stderr)
        return 1
        
    # 5. Build environment
    runner_env = os.environ.copy()
    runner_env["AWF_RUN_ID"] = run_id
    runner_env["AWF_CHECKPOINT_FILE"] = str(checkpoint_file.resolve())
    runner_env["AWF_WORKTREE_PATH"] = str(wt_path.resolve())
    runner_env["AWF_ARTIFACT_RUN_ID"] = args.artifact_run_id if args.artifact_run_id else run_id
    
    # 6. Run agent command
    session_manager.mark_status(checkpoint_file, "running", f"Running command: {' '.join(cmd_list)}")
    cmd_res = run_agent_command(cmd_list, wt_path, runner_env, args.timeout_sec)
    
    # Record command in checkpoint
    cmd_status = "pass" if cmd_res["exit_code"] == 0 else "fail"
    cmd_summary = f"Exit code {cmd_res['exit_code']}. Stderr tail: {cmd_res['stderr'][-200:].strip()}"
    session_manager.record_command(
        checkpoint_file,
        cmd=cmd_list,
        cwd=str(wt_path),
        status=cmd_status,
        exit_code=cmd_res["exit_code"],
        duration_ms=cmd_res["duration_ms"],
        summary=cmd_summary
    )
    
    # 7. Finalize status and cleanup
    exit_code = cmd_res["exit_code"]
    if exit_code == 0:
        session_manager.mark_status(checkpoint_file, "completed", "Command executed successfully")
        if args.cleanup == "on-success":
            try:
                remove_worktree(repo_root, wt_path, force=True)
                session_manager.append_event(checkpoint_file, "worktree_removed", "Worktree cleaned up successfully")
            except Exception as e:
                print(f"⚠️  Cleanup warning: {e}", file=sys.stderr)
    else:
        # Keep the worktree on failure so the user/developer can inspect the logs/state
        session_manager.mark_status(checkpoint_file, "failed", f"Command failed with exit code {exit_code}")
        
    return exit_code

def handle_status(args) -> int:
    repo_root = resolve_repo_root()
    run_id = slugify_run_id(args.run_id)
    checkpoint_file = session_manager.default_checkpoint_file(repo_root, run_id)
    
    if not checkpoint_file.exists():
        print(f"❌ No checkpoint found for run-id: {run_id}", file=sys.stderr)
        return 1
        
    checkpoint_data = session_manager.load_checkpoint(checkpoint_file)
    print(session_manager.render_summary(checkpoint_data))
    
    # Print changed files in worktree if worktree exists
    wt_path = Path(checkpoint_data["worktree"]["path"])
    if wt_path.exists():
        status_lines = git_status_porcelain(wt_path)
        if status_lines:
            print("\nModified files in worktree:")
            for line in status_lines:
                print(f"  {line}")
        else:
            print("\nNo modified files in worktree.")
            
    return 0

def handle_cleanup(args) -> int:
    repo_root = resolve_repo_root()
    run_id = slugify_run_id(args.run_id)
    checkpoint_file = session_manager.default_checkpoint_file(repo_root, run_id)
    
    if not checkpoint_file.exists():
        print(f"❌ No checkpoint found for run-id: {run_id}", file=sys.stderr)
        return 1
        
    checkpoint_data = session_manager.load_checkpoint(checkpoint_file)
    wt_path = Path(checkpoint_data["worktree"]["path"])
    
    if wt_path.exists():
        try:
            remove_worktree(repo_root, wt_path, force=args.force)
            session_manager.append_event(checkpoint_file, "worktree_removed", "Manual cleanup executed")
            print("✅ Worktree removed successfully.")
        except Exception as e:
            print(f"❌ Cleanup failed: {e}", file=sys.stderr)
            return 1
    else:
        print("ℹ️  Worktree path does not exist.")
        
    return 0

def main():
    # We parse the subcommand and its arguments. Everything after '--' is cmd_args.
    argv = sys.argv[1:]
    
    if "--" in argv:
        split_idx = argv.index("--")
        runner_argv = argv[:split_idx]
        cmd_args = argv[split_idx + 1:]
    else:
        runner_argv = argv
        cmd_args = []
        
    parser = argparse.ArgumentParser(description="AWF Worktree Runner CLI")
    subparsers = parser.add_subparsers(dest="subcommand", required=True)
    
    # Run command parser
    run_parser = subparsers.add_parser("run")
    run_parser.add_argument("--run-id", required=True)
    run_parser.add_argument("--task", required=True)
    run_parser.add_argument("--agent-id", required=True)
    run_parser.add_argument("--agent-role", required=True)
    run_parser.add_argument("--base-ref", default="HEAD")
    run_parser.add_argument("--worktree-root", default=None)
    run_parser.add_argument("--cleanup", choices=["never", "on-success"], default="never")
    run_parser.add_argument("--allow-dirty", action="store_true")
    run_parser.add_argument("--artifact-run-id", default=None)
    run_parser.add_argument("--timeout-sec", type=int, default=None)
    
    # Status parser
    status_parser = subparsers.add_parser("status")
    status_parser.add_argument("--run-id", required=True)
    
    # Cleanup parser
    cleanup_parser = subparsers.add_parser("cleanup")
    cleanup_parser.add_argument("--run-id", required=True)
    cleanup_parser.add_argument("--force", action="store_true")
    
    try:
        args = parser.parse_args(runner_argv)
    except SystemExit as e:
        return e.code
        
    if args.subcommand == "run":
        if not cmd_args:
            print("❌ Error: Command is required after '--'", file=sys.stderr)
            return 1
        return handle_run(args, cmd_args)
    elif args.subcommand == "status":
        return handle_status(args)
    elif args.subcommand == "cleanup":
        return handle_cleanup(args)
        
    return 0

if __name__ == "__main__":
    sys.exit(main())
