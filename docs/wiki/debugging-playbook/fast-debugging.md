# Fast Debugging: Evidence-First Method

The goal of fast debugging is not to make more guesses per minute. It is to make each hypothesis cheap, isolated and falsifiable.

## 1. Capture the symptom

Before editing code, record:

- exact failure/error/output;
- expected behavior;
- smallest known reproduction;
- when it last worked, if known;
- relevant environment/data differences.

Do not start with a fix hypothesis and search only for confirming evidence.

## 2. Shrink the reproduction

Reduce data, services and steps until the failure still reproduces with the smallest practical payload. Prefer temporary fixtures under `.tmp/` or test fixtures rather than destructive manipulation of real project data.

A good reproduction is repeatable from one command or one test.

## 3. Make the loop atomic

Bundle setup + reproduction + assertion into a script/test so each iteration starts from the same state.

Example:

```bash
python scripts/repro_bug.py
```

Better still, encode the reproduction as a regression test when practical.

## 4. Scout before changing

Inspect:

- recent relevant Git history;
- callers/dependents and data flow;
- configuration/environment drift;
- nearby tests and established conventions;
- optional code-intelligence impact analysis when available.

The six questions a completed debug should answer are:

1. What was the symptom?
2. How was it reproduced?
3. Expected vs actual?
4. What was the concrete root cause?
5. Why did it appear now?
6. What is the blast radius of the fix?

## 5. Bisect the search space

Use code/data/config bisection or `git bisect` where useful. Change one diagnostic variable at a time.

For concurrency problems, temporarily reduce concurrency only as a diagnostic technique; then restore the real execution model and reproduce/verify the fix under relevant concurrency.

## 6. Fix the cause, not the observation

A patch should explain why the root cause is removed. Avoid adding sleeps, broad exception swallowing, disabled assertions, or safety bypasses merely to make the symptom disappear.

## 7. Prove the fix

- regression test fails before/fails against old behavior where practical;
- regression test passes after the fix;
- surrounding tests remain green;
- lint/typecheck/build checks relevant to the project pass;
- high-risk fixes receive independent/security review as required.

## 8. Stop unproductive loops

After repeated failed hypotheses, stop editing and refresh evidence: reread logs, narrow the reproduction, inspect another boundary, or request an independent review. Do not turn a self-healing loop into unbounded patch churn.

## 9. Record durable learning

If the bug reveals a non-obvious recurring constraint, update versioned docs/ADR or store a concise durable memory when that optional capability is available.
