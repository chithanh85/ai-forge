---
name: advanced-debugging-tactics
description: Advanced debugging strategies and Unix tools (strace, bisection, MRE, atomic loops) when standard debugging fails.
---

# Advanced Debugging Tactics

This skill provides advanced methodologies and techniques for debugging difficult problems, adapted from "The Art of Debugging". Trigger this when the standard `/debug` workflow gets stuck or you face silent failures, memory leaks, or non-deterministic bugs.

## 1. Fast Debugging Methodology

### Create a Minimal Reproducible Example (MRE)

Never debug on the full payload or complex architecture if you don't have to.

- **Small Payload:** Use tiny data (e.g., a few rows instead of millions, a small mock model instead of the production model).
- **Small Scope:** Isolate the failing component into a single, standalone script.
- **Why?** Small data = faster restart time and easier mental math when tracing values.

### Atomic Debug Cycles

Ensure your debug run is a single fast command.

- If you need to clear cache and then run, combine them: `rm -rf cache && ./run.sh`.
- Do not rely on sequential manual steps where you might forget one step and test a false hypothesis.

## 2. Divide & Conquer (Bisection)

If you don't know where the bug is, slice the problem in half:

- **Code Bisection:** Put a `return` or a hardcoded mock in the middle of the pipeline. If the output is correct, the bug is in the second half. If it's wrong, the bug is in the first half.
- **History Bisection (`git bisect`):** If a feature used to work and now fails, use `git bisect` to find the exact commit that introduced the bug.

## 3. Unix Tools for Deep Debugging

When logs aren't enough, inspect the process from the outside:

- **`strace` (Linux):** Trace system calls. Extremely useful for finding silent permission errors, missing files, or hanging network calls. Example: `strace -e openat,stat -f ./my_program`
- **Environment Variables:** Use verbose logging flags for underlying libraries (e.g., `DEBUG=*`, `RUST_LOG=trace`, `PYTHONFAULTHANDLER=1`).

## 4. Silent Failures & Nondeterminism

- **Silent Failures (Output is wrong, no crash):** Start with known good synthetic data (e.g., `[1.0, 2.0]`) and trace its exact transformation at each step.
- **Nondeterministic Bugs (Flaky):** Fix the random seed (e.g., `random.seed(42)`). Force a single-threaded execution to rule out race conditions.

## Execution Rules

- Always verify your hypothesis by writing a failing test _before_ changing the implementation.
- Stop guessing. If you change code "to see if it fixes it" without understanding _why_, you are not debugging, you are guessing.
