# Plan: ClaudeKit Guardrails Integration for AWF Workflows

**Status**: Draft
**Created**: 2026-05-28
**Estimated**: M (4-6h)
**Assigned to**: Codex Agent + AWF specialist agents

## Context

AWF already has repo-wide preflight rules, Second Brain recall, TDD/self-healing loops, GitNexus guidance, and multi-agent orchestration. The current workflow files (`.agent/workflows/code.md`, `.agent/workflows/debug.md`, `.agent/workflows/plan.md`) are usable but do not yet enforce the ClaudeKit upgrades requested here:

- Debug work must scout and diagnose before proposing fixes.
- Planning and coding must be contract-driven, including `--fast` mode.
- Completion must be gated by structured JSON artifacts.
- Orchestration must assign specialist sub-agents with explicit ownership and outputs.

Recent commit history scan requested "20 commits"; this repository currently has 9 commits. Relevant recent changes include `/code-pro` Actor-Critic workflow, Google Engineering Practices fail-closed review gates, Karpathy behavioral rules, Clawpatch, Antigravity orchestration, and Rune Skill Mesh docs. GitNexus was refreshed before planning because the index was 2 commits stale.

## Current Review Findings

| Area                                                 | Current State                                                         | Gap                                                                                                                        |
| ---------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `/debug`                                             | Reproduce, recall, isolate, root cause, regression test, remember     | No mandatory Scout & Diagnose pass before fix proposal; no convention search, 20-commit scan, or caller/dependent analysis |
| `/plan`                                              | Context, recall, task breakdown, estimates, AC, tests                 | No required 5-part contract; no explicit `--fast` handling                                                                 |
| `/code`                                              | Reads plan, recall, TDD, self-healing, lint/test, remember            | Does not require contract artifacts before code; `--fast` path undefined                                                   |
| `AGENTS.md` / `GEMINI.md` / `.agent/rules/GEMINI.md` | Preflight, orchestration, TDD, checklist, Second Brain                | No artifact-gated approval protocol or canonical artifact names                                                            |
| `checklist.py`                                       | Runs lint, typecheck, tests, env parity                               | No JSON artifact validation hook                                                                                           |
| Orchestration                                        | `orchestrator.md` and `parallel-agents` define routing and boundaries | No ClaudeKit-specific role map or output contract per sub-agent                                                            |

## Goal

Add a clear implementation path for ClaudeKit-style guardrails without changing runtime behavior in this planning task. The future implementation should make AWF workflows safer by requiring explicit context, risk, verification, review, and adversarial validation artifacts before work is considered done.

## Success Criteria

- `/debug` cannot propose or apply a fix until Scout & Diagnose evidence exists.
- `/plan` and `/code` require a 5-prerequisite contract: Expected output, Acceptance Criteria, Scope boundary, Non-negotiable constraints, and Touchpoints.
- `--fast` still creates or validates a compact plan contract; it may reduce depth, not skip planning.
- `checklist.py` validates the 5 JSON artifacts when artifact-gated workflows are used.
- Orchestrator can assign specialist sub-agents with non-overlapping scopes and required JSON/Markdown outputs.
- Documentation and rules stay consistent across `AGENTS.md`, `GEMINI.md`, `.agent/rules/GEMINI.md`, and workflow files.

## Scope

### In Scope

- Update `.agent/workflows/debug.md`, `.agent/workflows/plan.md`, `.agent/workflows/code.md`.
- Update `AGENTS.md`, `GEMINI.md`, `.agent/rules/GEMINI.md`.
- Add artifact schema/docs under `.agent/artifacts/README.md` and `.agent/schemas/artifacts/*.schema.json`.
- Extend `.agent/scripts/checklist.py` with an artifact validation hook.
- Add focused tests for artifact validation.
- Update `.planning/STATE.md` and Second Brain after implementation.

### Out of Scope

- Replacing existing AWF workflow names or slash commands.
- Reworking `/code-pro`, `/clawpatch`, or `/ba-pipeline` beyond cross-references.
- Changing provider-specific execution flags in existing Codex/Claude/Gemini commands unless required by the artifact gate.
- Creating production feature code.

## Non-Negotiable Constraints

- TDD first for `checklist.py` artifact validation.
- No ad-hoc root files; generated artifacts live under `.agent/artifacts/<run-id>/`.
- No secrets in artifacts. Snippets must redact `.env`, tokens, credentials, cookies, and private keys.
- GitNexus impact analysis is required before editing functions/classes/methods; docs-only edits do not need symbol impact.
- High or Critical `risk-gate.json` must block implementation until explicitly approved.
- Existing user changes in the worktree must not be reverted.
- `--fast` may compress questions and artifact detail, but it must still create the contract and risk gate.

## Proposed File Layout

```text
.agent/
  artifacts/
    README.md
    <run-id>/
      context-snippets.json
      risk-gate.json
      verification.json
      review-decision.json
      adversarial-validation.json
  schemas/
    artifacts/
      context-snippets.schema.json
      risk-gate.schema.json
      verification.schema.json
      review-decision.schema.json
      adversarial-validation.schema.json
  scripts/
    checklist.py
  workflows/
    code.md
    debug.md
    plan.md
AGENTS.md
GEMINI.md
.agent/rules/GEMINI.md
tests/
  artifact-gate.test.ts
```

## Contract-Driven Workflow

Every `/plan` and `/code` run must produce or validate this contract before implementation:

| Prerequisite               | Required Content                                                | Used By                                    |
| -------------------------- | --------------------------------------------------------------- | ------------------------------------------ |
| Expected output            | Concrete files, behavior, or docs to produce                    | `project-planner`, implementers, reviewers |
| Acceptance Criteria        | Given-When-Then bullets; measurable pass/fail                   | `test-engineer`, checklist hook            |
| Scope boundary             | Files/areas allowed and explicitly forbidden                    | Orchestrator, sub-agents                   |
| Non-negotiable constraints | Security, style, TDD, no-secret, migration, compatibility rules | All agents                                 |
| Touchpoints                | Callers, dependents, routes, scripts, docs, external services   | Scout, GitNexus, risk gate                 |

`--fast` policy:

- Allowed: shorter recall summary, smaller Scout depth, one compact contract table, focused test set.
- Forbidden: skipping the contract, skipping risk gate, coding without plan, suppressing checklist failures.
- Required minimum output: a compact plan contract plus `risk-gate.json`.

## Scout & Diagnose Protocol for `/debug`

Add a new mandatory phase before root-cause claims or fix proposals:

### Phase 1A: Scout

- Read relevant state, plan, rules, and recalled lessons.
- Identify likely files and modules without editing.
- Search conventions in nearby files and docs.
- Run `git log -20 -- <path>` for suspected files, or repo-level `git log -20` if no path yet.
- Use GitNexus for caller/dependent analysis:
  - `context` for the suspected symbol.
  - `impact(direction="upstream")` before any symbol edit.
  - `api_impact` for route handlers.
- Capture selected evidence in `context-snippets.json`.

### Phase 1B: Diagnose

- Reproduce or state why reproduction is blocked.
- Separate symptom, suspected cause, confirmed cause, and unknowns.
- Write the risk decision to `risk-gate.json`.
- Only then propose a minimal fix and regression test.

## Artifact-Gated Approval Protocol

Each artifact is JSON, stored under `.agent/artifacts/<run-id>/`, and validated by `checklist.py`.

### 1. `context-snippets.json`

Purpose: prove the agent read enough real context before deciding.

Required fields:

```json
{
  "schema": "awf.context-snippets.v1",
  "run_id": "20260528-claudekit",
  "task": "ClaudeKit integration",
  "sources": [
    {
      "path": ".agent/workflows/debug.md",
      "lines": "1-80",
      "reason": "current debug workflow baseline",
      "summary": "Reproduce and recall exist; Scout & Diagnose missing"
    }
  ],
  "redactions": [],
  "created_at": "2026-05-28T00:00:00+07:00"
}
```

### 2. `risk-gate.json`

Purpose: fail closed before edits when risk is unclear or high.

Required fields:

```json
{
  "schema": "awf.risk-gate.v1",
  "run_id": "20260528-claudekit",
  "risk": "LOW",
  "decision": "ALLOW",
  "blast_radius": {
    "gitnexus": "not_applicable_docs_only",
    "direct_callers": 0,
    "affected_processes": []
  },
  "blockers": [],
  "approval_required": false
}
```

### 3. `verification.json`

Purpose: record commands, status, and evidence for completion.

Required fields:

```json
{
  "schema": "awf.verification.v1",
  "run_id": "20260528-claudekit",
  "commands": [
    {
      "cmd": "python .agent/scripts/checklist.py .",
      "status": "pass",
      "summary": "all checks passed"
    }
  ],
  "manual_checks": [],
  "known_failures": []
}
```

### 4. `review-decision.json`

Purpose: make review outcome explicit and machine-checkable.

Required fields:

```json
{
  "schema": "awf.review-decision.v1",
  "run_id": "20260528-claudekit",
  "reviewer": "codex",
  "decision": "APPROVE",
  "findings": [],
  "required_followups": []
}
```

### 5. `adversarial-validation.json`

Purpose: capture Red Team and abuse-case validation.

Required fields:

```json
{
  "schema": "awf.adversarial-validation.v1",
  "run_id": "20260528-claudekit",
  "threats_considered": [
    "prompt injection through copied snippets",
    "secret leakage in artifacts",
    "false approval with missing verification"
  ],
  "results": [
    {
      "scenario": "artifact contains token-like value",
      "outcome": "blocked_by_redaction_check"
    }
  ],
  "decision": "PASS"
}
```

## Checklist Hook Design

Extend `.agent/scripts/checklist.py` with a small validation layer:

- Discover active artifact directory from `AWF_ARTIFACT_RUN_ID`, `.agent/artifacts/current`, or latest modified run folder.
- If no artifact directory exists, keep current checks unchanged for backward compatibility.
- If artifact gating is active, require all 5 JSON files.
- Validate JSON syntax and required top-level fields.
- Fail if:
  - `risk-gate.decision` is `BLOCK`.
  - `risk-gate.risk` is `HIGH` or `CRITICAL` and `approval_required` is not resolved.
  - `verification.commands` has any required command with `status != "pass"` and no accepted known failure.
  - `review-decision.decision` is `REQUEST_CHANGES` or `BLOCK`.
  - `adversarial-validation.decision` is not `PASS`.
  - any artifact contains secret-like patterns.

Suggested implementation:

- Keep `run_check()` unchanged.
- Add pure helper functions: `find_artifact_run()`, `load_json_artifact()`, `validate_artifacts()`, `contains_secret_like_value()`.
- Test helper functions with fixture temp directories before changing CLI behavior.

## Orchestration Role Map

| Phase                  | Agent                                                            | Responsibility                                           | Output                                   |
| ---------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------- |
| Scout                  | `explorer-agent` or `code-archaeologist`                         | Map files, conventions, commit history, touchpoints      | `context-snippets.json` draft            |
| Plan contract          | `project-planner`                                                | Build 5-prerequisite contract and dependency graph       | Plan section in `docs/plans/*.md`        |
| Risk gate              | `security-auditor` + GitNexus                                    | Assess blast radius, security constraints, approval need | `risk-gate.json`                         |
| Implementation         | Domain agent (`backend-specialist`, `frontend-specialist`, etc.) | Implement only assigned files from approved scope        | Code changes + notes                     |
| Tests                  | `test-engineer` / `qa-automation-engineer`                       | Add regression/unit/integration/E2E tests by risk        | test files + `verification.json` entries |
| Review                 | `code-archaeologist` or Codex reviewer                           | Check correctness, style, hidden coupling                | `review-decision.json`                   |
| Adversarial validation | `security-auditor` / `penetration-tester`                        | Red Team prompt/data/security failure modes              | `adversarial-validation.json`            |
| Synthesis              | `orchestrator`                                                   | Merge outputs, enforce boundaries, run checklist         | final handoff                            |

Rules:

- Do not spawn sub-agents before the contract exists.
- Assign non-overlapping file ownership before any write.
- Debugger remains serial for root-cause work; it may request read-only Scout support but owns the final diagnosis.
- Parent/orchestrator is responsible for artifact consistency and final checklist.

## Implementation Tasks

### Task 1: Add Artifact Gate Tests

- **Files**: `tests/artifact-gate.test.ts` or a focused Python test harness if preferred.
- **Goal**: Lock expected validator behavior before editing `checklist.py`.
- **Acceptance Criteria**:
  - Given no artifact run, when checklist artifact validation runs, then it is skipped for backward compatibility.
  - Given all 5 valid artifacts, when validation runs, then it passes.
  - Given missing artifact, invalid JSON, `BLOCK` decision, or secret-like value, when validation runs, then it fails with a clear message.

### Task 2: Implement Artifact Validation Hook

- **Files**: `.agent/scripts/checklist.py`
- **Goal**: Add artifact-gated approval validation without disrupting existing lint/type/test/env checks.
- **Acceptance Criteria**:
  - Given `AWF_ARTIFACT_RUN_ID=<id>`, when `python .agent/scripts/checklist.py .` runs, then it validates `.agent/artifacts/<id>/`.
  - Given `risk-gate.json` has `decision: BLOCK`, then checklist exits non-zero.
  - Given no active artifact folder, then existing checks run as they do today.

### Task 3: Document Artifact Schemas

- **Files**: `.agent/artifacts/README.md`, `.agent/schemas/artifacts/*.schema.json`
- **Goal**: Make artifact names, required fields, and failure semantics discoverable to every AI client.
- **Acceptance Criteria**:
  - Each of the 5 artifacts has a schema file and example.
  - README explains redaction and run-id selection.
  - No artifact examples contain secrets or realistic credentials.

### Task 4: Upgrade `/debug` Workflow

- **Files**: `.agent/workflows/debug.md`
- **Goal**: Insert Scout & Diagnose before root-cause and fix phases.
- **Acceptance Criteria**:
  - Given `/debug`, when suspected files are known, then workflow requires convention search, `git log -20`, and caller/dependent analysis.
  - Given GitNexus returns High/Critical impact, then workflow blocks edit proposal until user approval.
  - Given fix is proposed, then `context-snippets.json` and `risk-gate.json` are already populated.

### Task 5: Upgrade `/plan` Workflow

- **Files**: `.agent/workflows/plan.md`
- **Goal**: Require the 5-prerequisite contract before task breakdown.
- **Acceptance Criteria**:
  - Given `/plan --fast`, when user asks for implementation, then workflow still writes a compact contract.
  - Given any missing prerequisite, then workflow asks or records an explicit assumption before planning.
  - Plan output includes Expected output, Given-When-Then AC, Scope boundary, Non-negotiable constraints, and Touchpoints.

### Task 6: Upgrade `/code` Workflow

- **Files**: `.agent/workflows/code.md`
- **Goal**: Prevent coding without a validated plan contract and risk gate.
- **Acceptance Criteria**:
  - Given no plan exists, `/code` routes to `/plan` first.
  - Given `--fast`, `/code` validates compact plan + risk gate before TDD.
  - Given code changes complete, workflow writes/updates `verification.json`, `review-decision.json`, and `adversarial-validation.json`.

### Task 7: Align Repo Rules

- **Files**: `AGENTS.md`, `GEMINI.md`, `.agent/rules/GEMINI.md`
- **Goal**: Add one canonical rule section for contract-driven execution and artifact-gated approval.
- **Acceptance Criteria**:
  - All three rules files reference the same 5 artifacts and `checklist.py` hook.
  - Rules explicitly state `--fast` does not bypass planning.
  - Rules include the Scout & Diagnose requirement for debug sessions.

### Task 8: Add Orchestration Assignment Protocol

- **Files**: `.agent/agents/orchestrator.md`, `.agent/skills/parallel-agents/SKILL.md` if needed.
- **Goal**: Define ClaudeKit-specific assignment templates for specialist sub-agents.
- **Acceptance Criteria**:
  - Orchestrator requires contract existence before spawn.
  - Sub-agent prompt template includes role, objective, context files, allowed files, forbidden files, artifact output, and timeout.
  - Parent synthesis requires artifact consistency check before final handoff.

### Task 9: Verify End-to-End

- **Files**: changed workflow/rules/scripts/tests only.
- **Goal**: Prove the guardrails work and do not break baseline AWF verification.
- **Acceptance Criteria**:
  - `npm run test` passes.
  - `npm run lint:check` passes.
  - `npm run typecheck` passes.
  - `python .agent/scripts/checklist.py .` passes with no artifact directory.
  - `AWF_ARTIFACT_RUN_ID=<fixture> python .agent/scripts/checklist.py .` passes for valid fixture and fails for invalid fixture.
  - `python .agent/scripts/obsidian_graph.py info claudekit` no longer fails due to encoding; either a wiki page exists or the no-docs result is handled.

## Risk Register

| Risk                                               | Impact | Mitigation                                                                 |
| -------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| Artifact gate blocks legacy workflows unexpectedly | Medium | Backward-compatible skip when no active artifact run is declared           |
| JSON artifacts become busywork                     | Medium | Keep required fields minimal and reusable across workflows                 |
| Secret leakage through context snippets            | High   | Redaction rule and secret-like scanner in checklist hook                   |
| `--fast` ambiguity                                 | Medium | Define fast as compact, not planless                                       |
| Sub-agent file conflicts                           | Medium | Enforce allowed/forbidden file ownership in orchestration template         |
| GitNexus stale index                               | Low    | Workflow says refresh with `npx gitnexus analyze` if stale warning appears |

## Verification

- [ ] Artifact validator tests pass.
- [ ] Existing checklist checks still run.
- [ ] Valid artifact fixture passes.
- [ ] Invalid artifact fixture fails.
- [ ] `/debug`, `/plan`, `/code`, and rules files reference the same artifact names.
- [ ] Second Brain stores the integration decision after implementation.
- [ ] `.planning/STATE.md` records completion and remaining tasks.

## Rollback Plan

- Revert changes to `.agent/scripts/checklist.py` if artifact validation blocks normal work.
- Keep schemas/docs because they are inert documentation.
- Restore previous workflow text from git for `/debug`, `/plan`, and `/code` if the new protocol proves too heavy.
- If only `--fast` behavior is problematic, temporarily disable artifact enforcement for `--fast` while keeping the compact contract requirement.

## Done When

- The implementation tasks above are complete.
- All verification commands pass or have documented accepted failures.
- Artifact-gated approval is enforced by `checklist.py`.
- AWF workflows and rules tell the same story across Codex, Claude, Gemini, and Antigravity.
