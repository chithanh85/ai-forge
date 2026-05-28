#!/usr/bin/env python3
"""
Verification checklist — Run before declaring any task done.
Usage: python .agent/scripts/checklist.py .
"""

import subprocess
import sys
import os
import json
import re
from pathlib import Path

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

REQUIRED_ARTIFACTS = {
    "context-snippets.json": [
        "schema",
        "run_id",
        "task",
        "sources",
        "redactions",
        "created_at",
    ],
    "risk-gate.json": [
        "schema",
        "run_id",
        "risk",
        "decision",
        "blast_radius",
        "blockers",
        "approval_required",
    ],
    "verification.json": [
        "schema",
        "run_id",
        "commands",
        "manual_checks",
        "known_failures",
    ],
    "review-decision.json": [
        "schema",
        "run_id",
        "reviewer",
        "decision",
        "reviewers",
        "findings",
        "required_followups",
    ],
    "adversarial-validation.json": [
        "schema",
        "run_id",
        "threats_considered",
        "rationalization_checks",
        "results",
        "decision",
    ],
}

SECRET_KEY_RE = re.compile(
    r"(^|[_-])(api[_-]?key|password|passwd|pwd|token|access[_-]?token|"
    r"refresh[_-]?token|secret|private[_-]?key|client[_-]?secret|"
    r"authorization|cookie)($|[_-])",
    re.IGNORECASE,
)
ENV_SECRET_KEY_RE = re.compile(r"^[A-Z0-9_]*(KEY|TOKEN|PASSWORD|SECRET)$")
SECRET_VALUE_PATTERNS = [
    re.compile(
        r"\b(api[_-]?key|password|passwd|pwd|token|access[_-]?token|"
        r"refresh[_-]?token|secret|client[_-]?secret)\s*[:=]\s*"
        r"[\"']?[^\"'\s,;]{4,}",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|OPENAI_API_KEY|"
        r"ANTHROPIC_API_KEY|GITHUB_TOKEN|DATABASE_URL)\s*[:=]\s*"
        r"[\"']?[^\"'\s,;]{4,}",
        re.IGNORECASE,
    ),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"\bBearer\s+[A-Za-z0-9._~+/-]{10,}=*", re.IGNORECASE),
]


class ArtifactValidationError(Exception):
    """Raised when artifact-gated approval evidence is missing or invalid."""

def run_check(name, cmd):
    """Run a check and return (name, passed, output)."""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, encoding="utf-8", timeout=60
        )
        passed = result.returncode == 0
        output = result.stdout.strip() or result.stderr.strip()
        return name, passed, output
    except subprocess.TimeoutExpired:
        return name, False, "TIMEOUT"
    except Exception as e:
        return name, False, str(e)

def find_artifact_run(project_root):
    """Find the active or latest artifact run directory."""
    artifacts_root = project_root / ".agent" / "artifacts"
    env_run_id = os.environ.get("AWF_ARTIFACT_RUN_ID")

    if env_run_id:
        run_dir = artifacts_root / env_run_id
        if run_dir.is_dir():
            return run_dir
        raise ArtifactValidationError(
            f"Artifact run '{env_run_id}' not found under .agent/artifacts"
        )

    current = artifacts_root / "current"
    if current.exists():
        if current.is_dir():
            return current
        run_id = current.read_text(encoding="utf-8").strip()
        run_dir = artifacts_root / run_id
        if run_id and run_dir.is_dir():
            return run_dir
        raise ArtifactValidationError(
            ".agent/artifacts/current does not point to a valid run directory"
        )

    if not artifacts_root.exists():
        raise ArtifactValidationError(
            "No artifact run directories found under .agent/artifacts; "
            "create .agent/artifacts/<run-id>/ with required approval artifacts"
        )

    run_dirs = [
        path
        for path in artifacts_root.iterdir()
        if path.is_dir() and path.name != "current"
    ]
    if not run_dirs:
        raise ArtifactValidationError(
            "No artifact run directories found under .agent/artifacts; "
            "create .agent/artifacts/<run-id>/ with required approval artifacts"
        )

    return max(run_dirs, key=lambda path: path.stat().st_mtime)

def load_json_artifact(run_dir, filename):
    """Load a required JSON artifact from an artifact run."""
    artifact_path = run_dir / filename
    if not artifact_path.exists():
        raise ArtifactValidationError(f"Missing artifact: {filename}")
    try:
        with artifact_path.open(encoding="utf-8") as artifact_file:
            data = json.load(artifact_file)
    except json.JSONDecodeError as exc:
        raise ArtifactValidationError(f"Invalid JSON in {filename}: {exc}") from exc
    if not isinstance(data, dict):
        raise ArtifactValidationError(f"{filename} must contain a JSON object")
    return data

def is_redacted_value(value):
    """Return true when a value is intentionally redacted."""
    if not isinstance(value, str):
        return False
    normalized = value.strip().lower()
    return normalized in {"", "[redacted]", "<redacted>", "redacted", "***"}

def find_secret_like_values(value, path="$"):
    """Find secret-like keys or strings in nested artifact JSON."""
    findings = []
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            key_is_secret = SECRET_KEY_RE.search(key) or (
                key.isupper() and ENV_SECRET_KEY_RE.match(key)
            )
            if key_is_secret and not is_redacted_value(child):
                findings.append(f"{child_path} uses secret-like key '{key}'")
            findings.extend(find_secret_like_values(child, child_path))
    elif isinstance(value, list):
        for index, item in enumerate(value):
            findings.extend(find_secret_like_values(item, f"{path}[{index}]"))
    elif isinstance(value, str) and not is_redacted_value(value):
        for pattern in SECRET_VALUE_PATTERNS:
            if pattern.search(value):
                findings.append(f"{path} contains secret-like value")
                break
    return findings

def validate_artifacts(project_root):
    """Validate artifact-gated approval JSON files."""
    try:
        run_dir = find_artifact_run(project_root)
        artifacts = {
            filename: load_json_artifact(run_dir, filename)
            for filename in REQUIRED_ARTIFACTS
        }
    except ArtifactValidationError as exc:
        return "Artifact Gate", False, str(exc)

    errors = []
    run_ids = set()
    for filename, required_fields in REQUIRED_ARTIFACTS.items():
        artifact = artifacts[filename]
        for field in required_fields:
            if field not in artifact:
                errors.append(f"{filename} missing required field: {field}")
        if "run_id" in artifact:
            run_ids.add(str(artifact["run_id"]))
        for finding in find_secret_like_values(artifact):
            errors.append(f"{filename}: {finding}")

    if len(run_ids) > 1:
        errors.append(f"Artifacts have mismatched run_id values: {sorted(run_ids)}")

    context = artifacts["context-snippets.json"]
    if not isinstance(context.get("sources"), list) or not context.get("sources"):
        errors.append("context-snippets.json sources must be a non-empty list")

    risk_gate = artifacts["risk-gate.json"]
    risk_decision = str(risk_gate.get("decision", "")).upper()
    risk_level = str(risk_gate.get("risk", "")).upper()
    if risk_decision == "BLOCK":
        errors.append("risk-gate decision is BLOCK")
    if risk_level in {"HIGH", "CRITICAL"} and risk_decision not in {
        "ALLOW",
        "APPROVE",
        "APPROVED",
        "PASS",
    }:
        errors.append(f"risk-gate risk {risk_level} requires explicit approval")

    verification = artifacts["verification.json"]
    commands = verification.get("commands")
    if not isinstance(commands, list) or not commands:
        errors.append("verification.json commands must be a non-empty list")
    else:
        for index, command in enumerate(commands):
            if not isinstance(command, dict):
                errors.append(f"verification.json commands[{index}] must be an object")
                continue
            if str(command.get("status", "")).lower() != "pass":
                errors.append(
                    f"verification.json command failed: {command.get('cmd', index)}"
                )

    review = artifacts["review-decision.json"]
    review_decision = str(review.get("decision", "")).upper()
    if review_decision in {"REQUEST_CHANGES", "BLOCK"}:
        errors.append(f"review-decision decision is {review_decision}")
    elif review_decision not in {"APPROVE", "APPROVED", "PASS"}:
        errors.append("review-decision decision must be APPROVE or PASS")
    reviewers = review.get("reviewers")
    if not isinstance(reviewers, list) or not reviewers:
        errors.append("review-decision.json reviewers must be a non-empty list")
    else:
        for index, reviewer in enumerate(reviewers):
            if not isinstance(reviewer, dict):
                errors.append(f"review-decision reviewers[{index}] must be an object")
                continue
            reviewer_name = str(
                reviewer.get("name") or reviewer.get("reviewer") or f"reviewers[{index}]"
            )
            reviewer_decision = str(reviewer.get("decision", "")).upper()
            reviewer_score = reviewer.get("score")
            if reviewer_decision == "BLOCK":
                errors.append(f"{reviewer_name} decision is BLOCK")
            if type(reviewer_score) not in {int, float}:
                errors.append(f"{reviewer_name} score must be numeric")
            elif reviewer_score < 3:
                errors.append(f"{reviewer_name} score {reviewer_score:g} is below 3")

    adversarial = artifacts["adversarial-validation.json"]
    adversarial_decision = str(adversarial.get("decision", "")).upper()
    if adversarial_decision != "PASS":
        errors.append("adversarial-validation decision must be PASS")
    rationalization_checks = adversarial.get("rationalization_checks")
    if not isinstance(rationalization_checks, list) or not rationalization_checks:
        errors.append(
            "adversarial-validation.json rationalization_checks must be a non-empty list"
        )

    if errors:
        return "Artifact Gate", False, "\n".join(errors)

    return "Artifact Gate", True, f"validated {run_dir}"

def main():
    project_root = sys.argv[1] if len(sys.argv) > 1 else "."
    os.chdir(project_root)
    project_root = Path.cwd()
    script_dir = Path(__file__).resolve().parent
    wiki_lint_script = script_dir / "wiki_lint.py"

    checks = [
        ("Lint",      "npm run lint:check 2>&1"),
        ("TypeCheck", "npm run typecheck 2>&1"),
        ("Tests",     "npm run test 2>&1"),
        ("Env Parity","python scripts/maintenance/env_parity_check.py 2>&1"),
        (
            "Wiki Lint",
            f'"{sys.executable}" "{wiki_lint_script}" --strict 2>&1',
        ),
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

    check_name, ok, output = validate_artifacts(project_root)
    status = "✅" if ok else "❌"
    print(f"  {status} {check_name}")
    if ok:
        passed_count += 1
    else:
        failed.append((check_name, output))

    print("=" * 50)
    total = len(checks) + 1
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
