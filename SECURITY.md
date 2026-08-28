# Security

This repository is a development-project template. Setup may create local credential files, install dependencies, initialize Git, and optionally configure local AI tooling.

## Rules

- Never commit API keys, private keys, database credentials, or Telegram bot tokens.
- Keep real secrets in ignored files such as `.env` and `credentials/credentials.toml`.
- Non-interactive setup must not implicitly enable optional integrations or execute remote installers.
- Pin and review external installers before using them in CI or production automation.
- Keep production credentials read-only for AI tooling wherever possible.

## Reporting

Report security issues privately to the owner of the project created from this template. Do not publish exploit details in an issue.
