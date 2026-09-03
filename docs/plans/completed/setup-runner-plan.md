# Historical Proposal — GitHub Actions Self-Hosted Runner

**Created:** 2026-05-20
**Historical status:** Proposal/archive
**Current relevance:** Optional infrastructure, project-specific

> This document records an early proposal. It is not a current AWF requirement and does not define the source repository's canonical CI environment.

## Original goal

Provide a helper for registering a GitHub Actions self-hosted runner on a user-controlled Linux host/VPS so projects could choose their own compute instead of relying only on hosted runners.

The repository contains `scripts/deploy/install-github-runner.sh` as an infrastructure helper. Using that script is optional and requires the operator to validate the current GitHub runner registration/service procedure before deployment.

## Current boundaries

- AWF core does not require a self-hosted runner.
- Do not hard-code a package manager into CI because target projects may use npm, pnpm, yarn or bun.
- Prefer project lockfiles and `.awf/manifest.json` logical commands when constructing CI checks.
- Registration tokens and runner credentials are secrets and must not be committed.
- A self-hosted runner executes repository-controlled code on your infrastructure; treat fork/untrusted PR execution as a high-risk trust boundary.
- Do not expose production credentials to untrusted pull-request workflows.

## Suggested modern validation

Before enabling a self-hosted runner for a project:

1. review the current GitHub Actions self-hosted runner documentation;
2. inspect `scripts/deploy/install-github-runner.sh` against that current procedure;
3. use least-privileged host/service credentials;
4. isolate the runner from sensitive production systems where practical;
5. run the project's logical lint/typecheck/test commands;
6. verify untrusted fork workflows cannot access privileged secrets or arbitrary local automation.

## Historical note

The original 2026-05-20 draft used then-current source-repo package-manager assumptions. Those examples are intentionally not preserved as present-day instructions because AWF v4.1 detects the target toolchain instead.
