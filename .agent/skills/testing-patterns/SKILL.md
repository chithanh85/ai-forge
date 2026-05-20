---
name: testing-patterns
description: "Use when writing tests, fixing test failures, or setting up testing infrastructure. Checks existing test framework and patterns before advising."
allowed-tools: Read, Write, Edit, Glob, Grep, RunCommand
version: 2.0
priority: HIGH
---

# Testing Patterns — Trust Through Verification

> **Untested code is broken code you haven't discovered yet.**

## When This Skill Activates

| Trigger                        | Example                             |
| ------------------------------ | ----------------------------------- |
| Writing new tests              | "Add tests for user service"        |
| Test failure investigation     | "Tests are failing after refactor"  |
| Setting up test infrastructure | "Configure testing for new project" |
| `/test` workflow               | Test generation and execution       |
| `/code` workflow               | TDD cycle (Red-Green-Refactor)      |

---

## 🔴 MANDATORY: Context Loading

```
1. Find test framework: grep for 'jest\|vitest\|mocha\|pytest\|playwright'
2. Check package.json scripts: "test", "test:unit", "test:e2e", "test:coverage"
3. Find existing tests: ls **/*.test.ts, **/*.spec.ts, **/*_test.py
4. Check test config: jest.config.ts, vitest.config.ts, playwright.config.ts
5. Check CI: .github/workflows/ → which test commands run in CI?
```

> **NEVER write tests without knowing which framework and patterns the project already uses.**

---

## Test Strategy (Match to Project)

| Your project has... | Test Types to Add                             |
| ------------------- | --------------------------------------------- |
| Backend API only    | Unit (services) + Integration (API endpoints) |
| Frontend + Backend  | Unit + Integration + E2E (critical flows)     |
| Library/SDK         | Unit (100% coverage goal)                     |
| Microservices       | Unit + Contract tests + Integration           |

### Testing Pyramid

```
        /  E2E  \        ← Few, slow, expensive (critical paths only)
       / Integration \    ← Some, test boundaries (API, DB)
      /     Unit      \   ← Many, fast, cheap (business logic)
```

---

## Test Pattern: AAA (Arrange-Act-Assert)

**Every test follows this pattern:**

```typescript
describe("UserService", () => {
  it("should create user with valid email", async () => {
    // Arrange — set up test data and dependencies
    const dto = { email: "test@example.com", name: "Test" };

    // Act — execute the thing being tested
    const user = await userService.create(dto);

    // Assert — verify the result
    expect(user.id).toBeDefined();
    expect(user.email).toBe(dto.email);
  });
});
```

---

## What to Test (Decision Guide)

| Code Type                    | Test?               | How?                                    |
| ---------------------------- | ------------------- | --------------------------------------- |
| Business logic (services)    | ✅ Always           | Unit tests, mock dependencies           |
| API endpoints                | ✅ Always           | Integration tests, real or in-memory DB |
| Database queries             | ✅ Critical ones    | Integration with test DB                |
| UI components                | ✅ Interactive ones | React Testing Library / Playwright      |
| Config/constants             | ❌ Skip             | No logic to test                        |
| Third-party library wrappers | ⚠️ Thin wrapper     | Only test YOUR logic, not the library   |

---

## Self-Healing Loop Integration

```
Code changed → Run tests
  ├── ALL PASS → Continue
  └── FAIL → Analyze failure
       ├── Test is wrong (spec changed) → Update test, get approval
       ├── Code is wrong → Fix code (max 3 retries)
       └── Environment issue → Fix env, re-run
```

> 🔴 **RULE:** Never modify test expectations just to make tests pass. Fix the CODE.

---

## 🔗 Cross-References

| Topic                             | Skill                             |
| --------------------------------- | --------------------------------- |
| TDD workflow (Red-Green-Refactor) | `@[skills/tdd-workflow]`          |
| E2E testing with Playwright       | `@[skills/webapp-testing]`        |
| API testing                       | `@[skills/api-patterns]`          |
| Database test setup               | `@[skills/database-design]`       |
| Performance testing               | `@[skills/performance-profiling]` |

---

## Verification

```bash
python .agent/skills/testing-patterns/scripts/test_runner.py .
```

Or use project's native command:

```bash
pnpm test          # or npm test
pnpm test:coverage # check coverage
```

---

## Test Naming Convention

```typescript
// Pattern: should {expected behavior} when {condition}
it("should return 404 when user does not exist");
it("should create order when payment succeeds");
it("should throw ValidationError when email is empty");
```

---

## Anti-Patterns

| ❌ Don't                         | ✅ Do                                    |
| -------------------------------- | ---------------------------------------- |
| Test implementation details      | Test behavior and outcomes               |
| One giant test file              | One test file per module/service         |
| No test database                 | Use test DB or in-memory (SQLite)        |
| Mock everything                  | Mock boundaries only (DB, external APIs) |
| Skip tests in CI                 | Tests MUST run in CI on every PR         |
| `console.log` debugging in tests | Use proper assertions                    |
| Test trivial getters/setters     | Test business logic only                 |
