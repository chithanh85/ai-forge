# Security Policy and Trust Boundaries

AWF is a development workflow template that can execute local commands, initialize Git state, install project dependencies, and optionally configure external AI/tool integrations. Treat bootstrap and agent execution as privileged developer automation.

## Secure defaults

- Shared AWF workflows must not disable a client's sandbox, approval, or trust protections.
- Non-interactive setup must not silently enable optional integrations.
- Executable integration packages should be pinned to a reviewed version or immutable artifact.
- AWF will not execute the unpinned Codebase-Memory remote installer from bootstrap.
- A placeholder build is not accepted as production-build evidence.
- High-risk work follows the stronger review/approval path defined by the risk contract.

## Secrets

Never commit API/model-provider tokens, private keys, database/cloud credentials, Telegram/remote-control tokens, or production `.env` files.

Real values belong in ignored local files such as `.env`, `.env.local`, `credentials/credentials.toml`, or `credentials/telegram.env`. Example files contain placeholders only.

## AI output is untrusted

Treat generated code, review findings, shell commands, dependency suggestions, and external-agent responses as untrusted until checked against repository evidence and verification gates.

An AI reviewer is not a substitute for tests, dependency/security scanning, human approval where required, production access controls, or deployment smoke tests.

## External integrations

Every optional integration adds a supply-chain and/or data boundary. Before enabling one:

1. identify what code/process will execute;
2. pin/review the version where practical;
3. understand what repository data it can read;
4. understand what it can write or execute;
5. keep credentials least-privileged;
6. verify disable/degradation behavior.

See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md).

## Production access

Prefer read-only or narrowly scoped production credentials for AI tooling. Do not grant a coding agent broad production write access merely because a workflow can technically use it.

## Reporting vulnerabilities

Report security issues privately to the repository/project owner. Avoid publishing exploit details, credentials, or proof-of-concept payloads in a public issue before the maintainer has had a reasonable opportunity to assess the report.
