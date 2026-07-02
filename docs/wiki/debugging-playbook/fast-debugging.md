# Fast Debugging Methodology (The Art of Debugging)

This document is adapted from the core principles of [The Art of Debugging](https://github.com/stas00/the-art-of-debugging). It outlines how to debug complicated issues quickly and efficiently.

## 1. Quick Iterations & Small Payload

The two most important needs for successful debugging are:

1. **The debug cycles must be quick**
2. **The data being debugged must be small**

### Quick Debug Cycles

If you have to wait 10 minutes to reach the failing code, you will lose context and get confused about which hypothesis you are testing. Ideally, getting to the error should take only a few seconds. Shrinking the data is the easiest way to achieve this.

### Small Payload (MRE)

Always reduce your payload to the absolute minimum:

- `[0.1, 0.2]` is much easier to mental-math than a 1000x1000 matrix.
- If an ML model fails, test on a 10K parameter model instead of a 175B parameter one.
- Use **synthetic data** (e.g., `[1.0, 2.0, 3.0]`) or **random data** to quickly trigger crashes without waiting for real data to load.

## 2. Make the Debug Loop Fast and Reliable

### Atomic Debug Cycles

Never rely on manual, sequential steps in your terminal (e.g., "first I run `rm -r data`, then I run `./run.sh`"). You will inevitably forget step 1 and test a false hypothesis.
Combine them into a single command:

```bash
rm -r data && ./run.sh
```

Hit `Arrow Up` and `Enter`. Your debug cycle is now atomic and foolproof.

### Alias Frequently Used Commands

If you use a command dozens of times a day, alias it:

```bash
alias pyt="pytest --disable-warnings --instafail -rA"
```

Keep aliases short (1-3 letters) for high-frequency commands.

### Cheatsheets

Maintain a personal "StasOverflow" (or personal Wiki) for commands you frequently search for. Organize them densely and vertically so your brain can scan them instantly.

## 3. Divide and Conquer (Bisection)

When you have a massive codebase and no idea where the bug is, don't guess. Cut the problem in half:

- **Code Bisection:** Put an early `return` or a hardcoded mock in the middle of your code. If the output is now correct, the bug is in the second half. If it still crashes, it's in the first half.
- **Git Bisect:** If a feature used to work and now fails, use `git bisect` to find the exact commit that introduced the bug. This is mathematically guaranteed to find the bad commit in `O(log N)` steps.

## 4. Single Process, Single Thread

Parallelism makes debugging nearly impossible.

- Force your code to run on a single CPU/GPU.
- Disable multi-threading or async workers temporarily.
- This ensures logs appear in order and race conditions are eliminated while you hunt down logic bugs.

---

_Source: [The Art of Debugging - Fast Debugging Methodology](https://github.com/stas00/the-art-of-debugging/tree/master/methodology)_
