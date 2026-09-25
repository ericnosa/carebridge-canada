# CareBridge Canada
Private synthetic-data demonstration, not a production clinical platform.

## Setup
Use Node 22+ and the included pnpm lockfile. Install with the Sites install-dependencies helper or pnpm install --frozen-lockfile. Run the existing dev script for your execution profile. `node node_modules/typescript/bin/tsc --noEmit` checks types; `npm run build` builds the Cloudflare-compatible Worker. The Sites workflow owns publishing and source synchronization.

## What works
Patient dashboard, sample care-navigation and appointment selection, in-memory rescheduling/cancellation, sample messages and prewritten response, sample record download, care journey, coverage explanation, care team, official resources, consent control demonstration, reduce-effects preference, clinician queue/snapshot, referral transition demonstration, organization overview/staff/onboarding, connector category filter/details/interest, readiness and ephemeral activity. Preferences only persist locally; demo care state resets on reload.

## Boundaries
No PHI inputs/uploads, no clinical database, no patient authentication or access grant, no emails/video/AI/clinical API integrations. All application /api/** routes return 403 except read-only /api/readiness. All people, appointments, counts and medical workflows are labelled fictional. Private Site access is not healthcare IAM. Public contact/applications are disabled.

## Design and governance
`docs/master-prompt.md` is the governing brief. `docs/architecture.md` contains the 24-part architecture/readiness package. Review the Readiness screen for human approvals and production controls not implemented. Sites hosting residency and subprocessors are not approved for PHI in this project.

## Security notes
No secrets or production bindings. Server response headers restrict external connections, frames, device APIs and forms; inline script allowance is limited to framework compatibility and is not a production CSP approval. Clinical activation would require a separately reviewed production environment, real IAM/authorization, data isolation, consent/audit, recovery, clinical governance and independent verification. Do not enable PHI in this preview.
