# Threat register — Stage 1 (TRA architecture)

Status: **Proposed**. Owner: Security Officer (to be appointed).
Full TRA with residual-risk disposition is an external workstream (§24).

## Trust boundaries

Public site ↔ patient app (`/app`) ↔ API ↔ PostgreSQL / object storage /
Integration Gateway ↔ external connectors. Frontends are untrusted; all
authorization is server-side.

## Register (initial — to be expanded in the TRA)

| risk_id | Asset | Threat | Mitigation (proposed) | Owner | Status |
|---|---|---|---|---|---|
| T-01 | Patient accounts | Account takeover / credential stuffing | MFA, risk-based step-up, rate limiting, breach-password screening | Security | Proposed |
| T-02 | Sessions | Session hijacking / fixation | Secure httpOnly cookies, server-side enforcement, rotation on privilege change | Security | Proposed |
| T-03 | Clinical records | Broken access control / IDOR | Deny-by-default RBAC+ABAC, RLS, negative tests per slice | Security | Proposed |
| T-04 | Multi-tenant data | Cross-tenant read/write (Clinic A → Clinic B) | `organization_id` on all tables, RLS, tenant-isolation tests | Security | Proposed |
| T-05 | Privileged consoles | Privilege escalation | Recent-MFA check on privileged routes, phishing-resistant MFA for admins | Security | Proposed |
| T-06 | Practitioner onboarding | Impersonation of licensed professional | Primary-source verification pipeline, person-to-licence binding (§28) | Credentialing | Proposed |
| T-07 | Insider | Staff snooping on records | Least privilege, no routine clinical access for support, snooping-pattern monitoring | Privacy | Proposed |
| T-08 | Break-glass | Misuse of emergency access | Distinct server policy: reason, re-auth, warning, short scope, enhanced audit, post-review (§6) | Security | Proposed |
| T-09 | Uploads | Malicious files | Authorization, type/size checks, quarantine, malware screening, private storage (§5) | Security | Proposed |
| T-10 | Audit store | Tampering / silent loss | Append-only, independently protected retention, outage fail-closed for sensitive actions (§7) | Security | Proposed |
| T-11 | AI gateway | Prompt injection, PHI leakage to model | Controlled gateway, minimum-necessary context, tenant isolation, no PHI until terms approved (§13) | Security | Proposed |
| T-12 | Connectors | Compromised/misconfigured integration | Gateway auth, signed webhooks, failure isolation, per-connector authorization evidence (§9) | Integration | Proposed |
| T-13 | Supply chain | Malicious dependency / tooling | Tooling register (§23.6), Dependabot, secret scanning, signed/reviewed releases | Security | Proposed |
| T-14 | Backups/logs | PHI exposure in logs/backups | PHI-free logging validated, encrypted backups, isolated recovery access (§5, §17) | Security | Proposed |
| T-15 | Notifications | PHI in SMS/email previews | Generic templates only ("You have a new secure CareBridge update") (§12) | Security | Proposed |

Fields per record (brief §5): risk_id, asset, threat, likelihood, impact,
mitigation, owner, status, review_date, verification_evidence, residual_risk,
acceptance authority. Likelihood/impact scoring happens in the TRA workstream.
