# CareBridge Canada — standing rules for coding agents

Governing brief: `docs/architecture/CareBridge-Canada-Astra-Master-Prompt-v2.1.pdf`
The premium ChatGPT-sourced build (carebridge-canada/) is now the main build. The chatgpt.site prototype is design reference only.

- `PHI_PRODUCTION_ENABLED=false` and `PAYMENTS_ENABLED=false`, enforced server-side. Synthetic data only.
- Never add real patient data, real clinical messaging, real medical uploads, real clinical integrations, real regulator lookups, live checkout, or free trials.
- Deny by default. All authorization server-side. Never trust client-supplied tenant or role.
- Every organization-scoped resource has `organization_id`. Data-access changes need tenant-isolation tests (Clinic A cannot access Clinic B).
- Patient data access requires an active `care_relationship` or documented authority.
- Only practitioners with credential status `Verified` (brief §28) get clinical access. Never auto-approve a credential. Never show a verified badge without evidence.
- Sensitive reads/writes/exports, role, consent, credential and billing changes write audit events.
- Emergency info (911, HealthLine 811, 9-8-8) and resources are never gated by login, onboarding, coverage, subscription, or payment.
- Never claim HIPA compliant, certified, clinically validated, penetration tested, government approved, or production ready.
- Status labels: Proposed, Implemented, Tested, Human Review Required, Approved, Blocked. Unbuilt UI functions show "Not implemented". Only a named human sets Approved.
- Roles: the 16 canonical roles in brief §6.
- No new dependencies without reason, licence, and maintenance status.
- Do not rewrite working, tested code unless asked. No long docs.
- Never print secret values. STOP before pushes, shared-data migrations, or deletions.
- One sprint run = one branch = one PR; CI must pass.
- End every task with: COMPLETED / TESTED (command + pass/fail counts) / BLOCKED / NEXT (max 3).
