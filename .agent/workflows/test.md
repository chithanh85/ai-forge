---
name: test
description: Test generation and execution with memory
---

# /test — Testing + Memory

## Trigger

User types `/test`

## Steps

### Phase 1: Analysis + Recall

1. Identify untested code
2. Load skill: `testing-patterns`, `tdd-workflow`
3. Activate agent: `test-engineer`
4. **AUTO-RECALL past test issues:**
   ```bash
   # MCP:
   mcp_second-brain_recall(query="test failures flaky tests")
   # Local:
   python .agent/skills/auto-memory/scripts/local_brain.py recall "test failures"
   ```
5. Report: known flaky tests, past test patterns

### Phase 2: Test Writing

1. Unit tests for business logic
2. Integration tests for API endpoints
3. E2E tests for critical user flows
4. Follow AAA pattern (Arrange-Act-Assert)

### Phase 3: Execution

1. Run `node scripts/awf/exec.mjs test` (or the manifest's logical `test` command).
2. Run the project's configured coverage command when one exists; report `NOT_CONFIGURED` otherwise.
3. Report results.

### Phase 4: Self-Healing

- If tests fail → Auto-fix code (not tests!)
- Rule: NEVER modify test expectations to make tests pass
- Max 3 auto-fix attempts before escalating
- **On each auto-fix, remember:**
  ```bash
  # MCP:
  mcp_second-brain_remember(
    topic="Test auto-fix: {test name}",
    detail="Failure: {reason}. Fix: {what changed}.",
    tags=["test", "autofix", "{module}"]
  )
  # Local:
  python .agent/skills/auto-memory/scripts/local_brain.py remember \
    "Test fix: {test}" "Failure: {reason}. Fix: {change}." \
    --tags test autofix --type incident
  ```

### Phase 5: Next Steps

- `/code` → Fix failing tests
- `/audit` → Run security scan (vbs-scan-security) if all tests pass
- `/deploy` → Deploy if codebase is secure and tests pass

### 📡 Teleport Hook (Auto)

If `../teleport/` exists and user is AFK:

```bash
node ../teleport/scripts/send-telegram.mjs "<emoji> *<Agent> on test suite:*
✅ {passed} tests passed
❌ {failed} tests failed
📊 Coverage: {coverage}%"
```

Then start reply listener per `@[skills/teleport-bridge]`.
