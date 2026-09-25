# RBAC matrix — 16 canonical roles (brief §6)

Status: **Proposed**. Implemented in Sprint 1 with deny-by-default server-side
policies; ABAC attributes (organization, care relationship, jurisdiction,
credential status, purpose, scope, consent/authority, assurance level) combine
with these roles. Profession is an ABAC attribute from a verified credential,
not a role.

| # | Canonical role | Scope | Key restrictions |
|---|---|---|---|
| 1 | Patient | Own records only | Self-service; delegated access via Authorized Representative only |
| 2 | Authorized Representative | Delegated patient scope | Separate verified identity, documented authority, scope, expiry, revocation |
| 3 | Healthcare Professional | Patients with active care relationship | Profession from verified credential; no browsing all patients |
| 4 | Clinic Staff | Scheduling / front desk | No clinical notes by default |
| 5 | Care Coordinator | Referrals, tasks, follow-ups | Within care relationships only |
| 6 | Billing Staff | Plans, subscriptions, invoices | No clinical data |
| 7 | Clinic Administrator | Clinic configuration, staff invitations | Cannot bypass credentialing |
| 8 | Organization Administrator | Organization-wide configuration | Membership ≠ clinical relationship |
| 9 | Medical Director | Approves clinical protocols | Approval needs this role + recorded approval |
| 10 | Credentialing Officer | Reviews provider credentials | Cannot approve own / own-org / conflicted credentials |
| 11 | Privacy Officer | PIA, disclosure review, access reviews, complaints | — |
| 12 | Security Officer | Security configuration, incidents, access reviews | — |
| 13 | Auditor | Read-only audit queries | Queries themselves are audited |
| 14 | Integration Administrator | Connector configuration | No clinical read by default |
| 15 | Support Agent | Support tooling | No routine clinical access; break-glass not available |
| 16 | System Administrator | Infrastructure only | No routine clinical access |

## Denied actions (non-exhaustive — each gets a negative test)

- Any role: read/write outside own `organization_id` tenant.
- Healthcare Professional: open a patient without an active care relationship.
- Support Agent: view clinical records.
- Clinic Administrator / Organization Administrator: grant privileges beyond their authority; bypass credential verification.
- Credentialing Officer: approve their own credential.
- Billing Staff: access clinical data; invoices containing clinical fields.
- Patient: view another patient's appointments/records (IDOR/BOLA).
- Privileged roles: access consoles without a recent verified MFA session.
- Demo privileged account: sign in outside the demo environment.

## Delegated / emergency access

- Caregiver/proxy access: via Authorized Representative role only (verified identity + authority + expiry).
- Break-glass: distinct server policy, authorized roles/scenarios only; requires reason,
  re-authentication, explicit warning, short scope/duration, enhanced audit,
  alerting, post-access review. Never silently bypasses tenant/jurisdiction/legal restrictions.
