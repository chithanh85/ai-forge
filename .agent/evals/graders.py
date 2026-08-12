#!/usr/bin/env python3
"""
Enterprise Deterministic Output Graders for AWF Enterprise Template.
Evaluates AI Agent code, schema compliance, and artifact contracts.
"""

import os
import json
import re
from typing import Dict, Any, List

class EnterpriseCodeGrader:
    @staticmethod
    def grade_code_quality(code_text: str, criteria: Dict[str, Any]) -> Dict[str, Any]:
        score = 100
        reasons: List[str] = []

        # 1. Required Tokens
        for token in criteria.get("must_contain_tokens", []):
            if token not in code_text:
                score -= 25
                reasons.append(f"Missing required token: '{token}'")

        # 2. Forbidden Anti-patterns
        for forbidden in criteria.get("forbidden_tokens", []):
            if forbidden in code_text:
                score -= 35
                reasons.append(f"Found forbidden anti-pattern: '{forbidden}'")

        passed = score >= 80
        return {
            "passed": passed,
            "score": max(score, 0),
            "reasons": reasons
        }

    @staticmethod
    def grade_artifact_contract(folder_path: str, criteria: Dict[str, Any]) -> Dict[str, Any]:
        """Validates presence, JSON schema, reviewer score, and non-BLOCK decision for 5 Artifact files"""
        missing_files = []
        schema_failures = []
        required_artifacts = criteria.get("must_generate_artifacts", [])

        for file_name in required_artifacts:
            full_path = os.path.join(folder_path, file_name)
            if not os.path.exists(full_path):
                missing_files.append(file_name)
            else:
                try:
                    with open(full_path, "r", encoding="utf-8") as f:
                        data = json.load(f)

                    if file_name == "review-decision.json":
                        decision = str(data.get("decision", "")).upper()
                        reviewer_score = data.get("reviewer_score", 5)
                        if decision == "BLOCK":
                            schema_failures.append(f"review-decision.json contains BLOCK decision")
                        if reviewer_score < 3:
                            schema_failures.append(f"review-decision.json score {reviewer_score} < 3 threshold")

                    elif file_name == "adversarial-validation.json":
                        if "rationalization_checks" not in data:
                            schema_failures.append("adversarial-validation.json missing rationalization_checks field")

                except Exception as e:
                    schema_failures.append(f"{file_name} invalid JSON ({str(e)})")

        reasons = []
        for mf in missing_files:
            reasons.append(f"Missing artifact file: {mf}")
        for sf in schema_failures:
            reasons.append(f"Schema/Policy failure: {sf}")

        passed = len(missing_files) == 0 and len(schema_failures) == 0
        score = 100 if passed else max(0, 100 - (len(missing_files) * 20 + len(schema_failures) * 25))

        return {
            "passed": passed,
            "score": score,
            "reasons": reasons
        }
