# PHI data-flow register — Stages 0–2

Status: **Proposed**. All flows below are **synthetic-data only** until the §20
PHI go-live gate passes with documented evidence and human sign-off.

## Flow records

| # | Data | Source → Destination | Purpose | Authority | Storage | Retention |
|---|---|---|---|---|---|---|
| F-01 | Patient profile (synthetic) | Patient app → API → PostgreSQL (ca-central-1) | Care navigation | Consent (Sprint 2 model) | RDS ca-central-1, encrypted at rest | Per policy (TBD by counsel — not invented here) |
| F-02 | Audit events | API → append-only audit store | Accountability (§7) | Legal obligation (TBD) | RDS ca-central-1, immutable | Independently protected; TBD |
| F-03 | Credential evidence | Credentialing Officer → private object storage | Practitioner verification (§28) | Policy + practitioner notice (TBD) | S3 ca-central-1 (private) | Per policy (TBD) |
| F-04 | Uploads (synthetic) | Patient/provider app → quarantine → private storage | Clinical documents | Consent | S3 ca-central-1, scanned, short-lived download grants | Per policy (TBD) |
| F-05 | Notifications | API → SES (ca-central-1) → SMS/email gateways | Generic alerts only | Consent | No PHI in payloads (§12) | Logs PHI-free |
| F-06 | Backups | RDS → encrypted backups (ca-central-1) | Recovery (§17) | Operations | ca-central-1, isolated recovery access | RPO per service (TBD) |
| F-07 | AI gateway (future) | API → reviewed AI provider | Intake assistance, summaries (§13) | TBD — no PHI until terms approved | TBD | TBD |

## Boundaries

- Frontends never call external healthcare data APIs directly; all go through the
  backend Integration Gateway (§9).
- PHI never in: public URLs, source bundles, analytics, ordinary logs, crash
  reports, unsecured exports, notification previews, service-worker caches (§5).
- Dev/staging use synthetic datasets only. Production PHI is disabled
  (`PHI_PRODUCTION_ENABLED=false`) until the §20 gate.
