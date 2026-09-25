# Security policy

## Scope

CareBridge Canada is under active development. All environments currently run on
**synthetic data only**. There is no production PHI in this repository, in CI logs,
or in any deployment. `PHI_PRODUCTION_ENABLED=false` and `PAYMENTS_ENABLED=false`
are enforced server-side.

## Reporting a vulnerability

Please report security issues privately — do **not** open a public issue.

- Use GitHub's private vulnerability reporting for this repository
  (Security tab → Report a vulnerability), if enabled for the plan.
- If private reporting is unavailable, contact the repository owner directly.

Include: affected version/commit, steps to reproduce, and impact assessment.
Do not include real personal or health data in any report.

## What we ask of contributors

- Never commit secrets, credentials, tokens, or private keys.
- Never paste secret values into chats, prompts, or issue comments. Report only
  the file and line where a secret was found.
- Secret scanning with push protection is enabled; do not attempt to bypass it.
- Dependencies are updated weekly via Dependabot; security updates are applied promptly.

## Status

This policy will be extended with incident response contacts and a coordinated
disclosure timeline before any closed pilot handling real data (Stage 10 gate).
