# Architecture package — CareBridge Canada

Status convention: **Proposed** until a named human reviewer marks otherwise.
Only a named human can set **Approved**.

Governing brief: `CareBridge-Canada-Astra-Master-Prompt-v2.1.pdf` (repo copy to be added).

| # | Document | Brief § | Stage | Status |
|---|---|---|---|---|
| ADR-001 | Stack selection | §23.1 | 0 | Proposed — awaiting founder approval |
| 1 | System architecture, deployment boundaries, ADRs | §19.1 | 0–2 | Proposed (stub) |
| 2 | PHI data-flow diagrams and register | §19.2 | 0–2 | Proposed — see `phi-data-flows.md` |
| 3 | Database schema, migrations strategy, ownership, retention, provenance | §19.3 | 2 | Proposed — see `schema-draft.md` |
| 4 | RBAC matrix incl. denied and delegated actions | §19.4 | 3 | Proposed — see `rbac-matrix.md` |
| 5 | ABAC rules with executable policy test cases | §19.5 | 3 | Proposed (stub) |
| 6 | Consent and lawful-authority architecture | §19.6 | 4 | Proposed (stub) |
| 7 | Audit event model, storage, review, outage behavior | §19.7 | 4 | Proposed (stub) |
| 8 | Threat/risk model and clinical hazard register | §19.8 | 1 | Proposed — see `threat-register.md` |
| 9 | PIA readiness map, processor register, unresolved legal questions | §19.9 | 0 | Proposed — see `data-inventory.md` |
| 10 | Jurisdiction engine and supported cohort restrictions | §19.10 | 5 | Proposed (stub) |
| 11 | Connector catalogue, gateway contracts, authorization evidence model | §19.11 | 7 | Proposed (stub) |
| 12 | Patient flow incl. unavailable care and emergency access | §19.12 | 6 | Proposed (stub) |
| 13 | Provider flow and credential lifecycle | §19.13 | 6 | Proposed (stub) |
| 14 | Organization/staff flow and separation of duties | §19.14 | 6 | Proposed (stub) |
| 15 | Admin/support/privacy/security flow | §19.15 | 6 | Proposed (stub) |
| 16 | Clinical routing, escalation, results, referral ownership flow | §19.16 | 5–6 | Proposed (stub) |
| 17 | Liquid Glass design system with solid/reduced-motion examples | §19.17 | — | Proposed (stub) |
| 18 | Design tokens with contrast validation | §19.18 | — | Proposed (stub) |
| 19 | Accessible component library and state specifications | §19.19 | 8 | Proposed (stub) |
| 20 | Security architecture and PHI activation mechanism | §19.20 | 2 | Proposed (stub) |
| 21 | SLI/SLO architecture, DR plan, incident/runbook framework | §19.21 | 8/11 | Proposed (stub) |
| 22 | Prioritized MVP backlog with dependencies and acceptance criteria | §19.22 | — | Proposed (stub) |
| 23 | Test strategy, test-data approach, independent assessment scope | §19.23 | 8–9 | Proposed (stub) |
| 24 | Go-live evidence register and closed-pilot plan | §19.24 | 10 | Proposed (stub) |
| 25 | Pricing, billing and entitlement model | §19.25 | 6 | Proposed (stub) |
| 26 | Repository, CI, environment and tooling register | §19.26 | 0 | Proposed (stub) |
| 27 | Credentialing policy, verification pipeline, monitoring design | §19.27 | 3–4 | Proposed (stub) |

Current gate position: **Stage 0 (PIA readiness)** — no stage has exit evidence yet.
