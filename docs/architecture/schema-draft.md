# Database schema draft — Stage 2

Status: **Proposed**. Implemented in Sprint 1–2 via versioned Drizzle migrations
with foreign keys, constraints, and transactional state transitions (§25).

## Conventions

- Every organization-scoped table carries `organization_id` (never trusted from client input).
- Tenant isolation enforced by PostgreSQL Row-Level Security policies + server-side checks.
- State machines use transactional transitions with optimistic concurrency and idempotency keys.
- Audit capture via append-only `audit_events` (no UPDATE/DELETE permitted).

## Domains (§5)

Identity, Patient, Coverage, Clinical Record, Provider, Credential, Organization,
Appointment, Referral, Consent, Audit, Integration Gateway, Notification, Billing
(billing tables never join clinical records).

## Core tables (Sprint 1)

- `organizations`, `clinics` (location/department hierarchy per §11)
- `memberships` (user ↔ organization, role, status)
- `users` (identity: verified email, MFA enrolment, assurance level)
- `webauthn_credentials`, `totp_secrets`, `recovery_codes` (MFA per §6)
- `sessions` (server-side, secure cookies)
- `audit_events` (append-only; fields per §7)

## Sprint 2 additions

- `practitioner_identities`, `provider_credentials` (statuses: Unverified, Pending,
  Verified, Restricted, Suspended, Expired), `credential_attributes`,
  `credential_evidence`, `verification_decisions`, `liability_coverage`,
  `affiliation_attestations`, `monitoring_schedule` (§28.6)
- `care_relationships` (patient, provider, clinic, org, type, authority, dates, status)
- `consent_records`, `processing_authorities` (separate tables, §7)

## Later slices

Appointments (idempotent booking, §12), referrals (state machine, §12), messages,
care plans, coverage verifications, connector configs, plans/subscriptions/
entitlements/invoices (§22.4).

Migrations strategy: forward-only versioned migrations; STOP checkpoint before any
migration on shared data (§23.5). Seed data is synthetic and clearly labelled.
