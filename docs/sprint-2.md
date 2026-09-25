# Sprint 2 implementation — 2026-09-24

## Existing-code audit
- KEEP: patient, clinician and organization synthetic walkthroughs; shared glass surfaces, navigation, dialogs, existing dependencies and lockfile.
- MODIFY: release policy centralizes a hard false PHI constant; security headers add HSTS; organization navigation links to Sprint 2 status; misleading private-demo wording removed because current audience is public.
- REMOVE: no working features removed. No sensitive signup, uploads, admin self-enrollment or clinical mutations introduced.
- BUILD: 28 typed tables with generated migrations, tenant references and indexes; immutable tenant IDs and cross-tenant reference triggers; append-only audit and consent history protections; credential/evidence checks; default-deny policy functions; server-resolved membership/session checks; protected read-only governance routes; official-source links and regression tests.

## Security boundaries
The public workspace selector remains a synthetic UX demonstration. It grants no server authority. Protected consoles require dispatch-authenticated identity plus a server-resolved hashed session token, active membership and MFA within 15 minutes. There is no session issuer, MFA enrollment or self-service role assignment in this release. Consequently no user can currently activate these consoles through the application. Do not manually fabricate MFA evidence or seed privileged sessions to bypass this gate.

All clinical APIs and all governance writes remain blocked. No request body is accepted for PHI. No file upload endpoint, AI execution or live connector exists. The database contains no seeded users, patients, providers or approvals. Storage is a foundation for synthetic development only, not approved PHI hosting.

D1 queries bind organization IDs from the server principal. Clinic checks exist in the authorization policy; no patient API is enabled. SQLite has no RLS here: application predicates and cross-tenant reference triggers are the current controls. Database administrator access can alter/drop triggers; immutable off-site audit storage and independent monitoring remain required. Consent changes will append versions when a reviewed write workflow is implemented, never overwrite history.

Read-only governance summaries audit attempts for resolved principals and fail closed on audit/database failures. Anonymous denied attempts and dispatch login/logout do not yet feed durable application security telemetry. No production rate limiting, SIEM delivery, session issuance, WebAuthn/TOTP, field encryption or malware-scanning implementation is claimed. HSTS is configured; host-managed encryption, TLS and backup properties still need evidence and review. CSP preserves the existing inline-script exception required by this application; nonce hardening remains outstanding.

## Unfinished / externally blocked
- Confirm identity provider and verified MFA claims, staff provisioning, role administration and session lifecycle; then add endpoint integration tests with the provider.
- Complete operational record editing, consent withdrawals, credential reviews, privacy investigations, security events, incident transitions, clinical approval and governance evidence review. Current consoles are locked/read-only summaries, not completed operational workflows.
- Obtain privacy/legal assessment of organizational roles, processing authority, retention, hosting/data residency and agreements; complete PIA/TRA.
- Establish clinical reviewers, protocols, credential evidence and emergency-pathway approvals. Developers have not approved clinical content.
- Review vendors, connector authorizations, supported FHIR versions and AI processors; real external operations remain unavailable.
- Complete rate limiting, SIEM/alerts, immutable audit export, independent pen test, dependency/SAST/secret scanning pipeline, backup restoration and incident/recovery exercises.
- Complete WCAG 2.2 AA review. Existing styling retained; new summaries use semantic tables, focus indicators and responsive layout. No accessibility certification claimed.

## Validation
Run `node --test tests/authorization.test.mjs`, `python tests/database_test.py`, and `pnpm exec tsc --noEmit`.
Policy tests verify positive access, anonymous/cross-tenant/cross-clinic denial, role escalation, revocation, session and MFA expiry, consent and credential restrictions, authority, unpublished content, unavailable connectors and fixed PHI blocking. SQLite tests execute migrations and verify isolation constraints, synthetic labels, audit immutability and approval evidence. These are local policy/database tests, not independent penetration testing or end-to-end proof of healthcare authorization.

## Primary references checked
- Saskatchewan IPC PIA: https://oipc.sk.ca/privacy-impact-assessments/
- Saskatchewan IPC audit guidance: https://oipc.sk.ca/resources/resource-directory/audit-and-monitoring-guidelines-for-trustees/
- SHA HealthLine 811: https://www.saskhealthauthority.ca/your-health/conditions-illnesses-services-wellness/healthline-8-1-1
- OWASP authorization: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html

These guide the architecture; the build order is a CareBridge project policy, not a declared legal standard. Source availability does not establish CareBridge compliance.

## Foundation continuation
Membership-bound session issuance and logout now use dispatch identity, hashed tokens, secure cookies and durable login/logout audit. No MFA claim is inferred from sign-in. Role permission grants are default-deny and require trusted provisioning; no public registration grants membership. Patient retrieval is synthetic-only and resolves clinic, relationship, latest credential, purpose/scope/recipient authority and newest consent version from storage. Role changes and consent withdrawals use atomic mutation/audit batches. Governance summaries use the same service, reject clinic-scoped access to organization-wide registers, and never expose sessions or audit contents. Remaining blocked: trusted initial organization/staff/permission provisioning, approved MFA provider enrollment and step-up integration, clinical publishing, real PHI, export, connector execution, and production security/legal assessments.
Run `node --test tests/*.test.mjs` and `python tests/database_test.py`. Integration tests use Node SQLite to execute the actual service SQL through a D1-compatible test adapter; they are not deployed identity-provider or penetration tests.
