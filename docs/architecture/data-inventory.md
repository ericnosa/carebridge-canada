# Data inventory & PIA readiness map — Stage 0

Status: **Proposed**. Owner: Privacy Officer (to be appointed).
Reviewer: (to be appointed). Review date: —. Next review: —.

Saskatchewan HIPA is the principal legal reference for the Saskatchewan design,
subject to qualified review of applicability (§4). CareBridge's role (trustee,
service provider, or other) must be established per relationship by counsel.

## Data categories (proposed — collect only necessary fields)

| Category | Examples | Sensitivity | Notes |
|---|---|---|---|
| Identity | name, email, phone, government photo ID (providers) | High | ID images kept only per retention policy (§28.2) |
| Health services number | provincial coverage number | High | Masked by default; reveal is authorized + audited (§5) |
| Coverage | coverage status, verification timestamp | Medium | Statuses per §10; verified-only via authorized source |
| Clinical | symptoms, allergies, medications, diagnoses, intake, notes, prescriptions, referrals, results, imaging info, mental-health info | High (PHI) | Synthetic only until §20 PHI gate passes |
| Communications | secure messages, appointment history | High | Generic notifications only via SMS/email (§12) |
| Practitioner | licence/registration, specialty, liability coverage, background checks | High | PIA entry required before real onboarding (§28.8) |
| Billing | plans, subscriptions, invoices, billing contacts | Medium | Separate domain; never joined to clinical records (§5, §22) |
| Pilot interest | name, organization, role, email | Medium | Real PI even in demo — PIA entry + notice required (§22.3) |
| Telemetry | performance metrics | Low | Must be PHI-free; no session replay in authenticated areas (§15) |

Metadata is treated as potentially sensitive (§4).

## Processor inventory (proposed)

| Processor | Purpose | Hosting region | Status |
|---|---|---|---|
| AWS (compute, RDS, S3, SES) | hosting, database, storage, email | ca-central-1 (Montreal) | Proposed |
| GitHub | source control, CI | US (note: code only, no PHI) | Proposed |
| Identity-verification vendor | provider identity proofing (§28.2) | TBD — vendor review required | Blocked |
| Video provider | consultations (§12) | TBD — assessment required | Blocked |
| Payment processor | organization billing (§22) | TBD — vendor review + PIA entry required | Blocked |
| AI provider | AI gateway (§13) | TBD — no PHI until terms approved | Blocked |

## Unresolved legal questions (need counsel)

1. CareBridge's exact role per relationship (trustee vs service provider vs other).
2. Other applicable provincial/federal laws beyond Saskatchewan HIPA.
3. Pricing model review against the Canada Health Act and Saskatchewan rules (§20 commercial gate).
4. Regulator permission for register use in credentialing (§28.5, §28.8).
5. Retention/destruction rules per data category (no invented universal periods, §4).
