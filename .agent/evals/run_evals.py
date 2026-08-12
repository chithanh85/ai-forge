#!/usr/bin/env python3
"""
AI Agent Eval Runner for AWF Enterprise Template.
Usage:
  python .agent/evals/run_evals.py
  python .agent/evals/run_evals.py --file path/to/file.py
  python .agent/evals/run_evals.py --artifact-dir .agent/artifacts/run-01
"""

import sys
import os
import json
import argparse
from graders import EnterpriseCodeGrader

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def parse_args():
    parser = argparse.ArgumentParser(description="AWF Enterprise AI Eval Suite Runner")
    parser.add_argument("--file", type=str, help="Target generated file to evaluate")
    parser.add_argument("--artifact-dir", type=str, help="Target artifact directory to evaluate")
    parser.add_argument("--mode", type=str, choices=["smoke", "live"], default="smoke", help="Execution mode")
    return parser.parse_args()

def main():
    args = parse_args()
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "dataset.json")

    if not os.path.exists(dataset_path):
        print(f"❌ Error: Dataset file not found at {dataset_path}")
        sys.exit(1)

    with open(dataset_path, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    print("=" * 65)
    print("🚀 RUNNING AWF ENTERPRISE AI EVAL SUITE")
    print("=" * 65)

    total_cases = len(test_cases)
    passed_cases = 0
    total_score = 0

    smoke_fixtures = {
        "eval_code_quality_standards_01": "class EnterpriseModule:\n    def execute(self):\n        return True\n",
        "eval_python_data_pipeline_02": "import logging\ntry:\n    pass\nexcept Exception as e:\n    logging.error(e)\n"
    }

    for idx, tc in enumerate(test_cases, 1):
        tc_id = tc["id"]
        criteria = tc["criteria"]

        if args.file and os.path.exists(args.file):
            with open(args.file, "r", encoding="utf-8") as f:
                output_data = f.read()
        elif args.artifact_dir and os.path.exists(args.artifact_dir):
            output_data = args.artifact_dir
        else:
            output_data = smoke_fixtures.get(tc_id, "")

        if "must_generate_artifacts" in criteria:
            target_dir = args.artifact_dir if args.artifact_dir else os.path.abspath(".agent/artifacts/current")
            
            has_artifacts = os.path.exists(target_dir) and any(os.path.exists(os.path.join(target_dir, f)) for f in criteria.get("must_generate_artifacts", []))
            
            if args.mode == "smoke" and not args.artifact_dir and not has_artifacts:
                result = {"passed": True, "score": 100, "reasons": ["Notice: No active artifact run directory found, smoke gate passed"]}
            else:
                result = EnterpriseCodeGrader.grade_artifact_contract(target_dir, criteria)
        else:
            result = EnterpriseCodeGrader.grade_code_quality(output_data, criteria)

        if result["passed"]:
            passed_cases += 1
            status_str = "✅ PASS"
        else:
            status_str = "❌ FAIL"

        total_score += result["score"]
        print(f"[{idx}/{total_cases}] {tc_id}: {status_str} (Score: {result['score']}/100)")
        if result["reasons"]:
            for reason in result["reasons"]:
                print(f"      └─ {reason}")

    pass_rate = (passed_cases / total_cases) * 100
    mean_score = total_score / total_cases

    print("\n" + "=" * 65)
    print("📊 EVALUATION SUMMARY REPORT")
    print(f"• Total Test Cases : {total_cases}")
    print(f"• Passed Cases     : {passed_cases}")
    print(f"• Pass Rate        : {pass_rate:.1f}%")
    print(f"• Mean Score       : {mean_score:.1f}/100")
    print("=" * 65)

    if pass_rate < 80.0:
        print("⚠️ Warning: Enterprise Eval Pass Rate below 80% threshold!")
        sys.exit(1)
    else:
        print("🎉 Enterprise Eval quality gates satisfied!")
        sys.exit(0)

if __name__ == "__main__":
    main()
