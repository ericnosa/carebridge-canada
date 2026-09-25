# Merge notes — 2026-09-25

Per Eric's decision, the premium ChatGPT-sourced build is now the **main development build**:
`/home/hatch/workspace/carebridge-chatgpt-build/carebridge-canada/`.
The local Sprint 0 build at `/home/hatch/workspace/carebridge-canada/` was treated as
**read-only** and is untouched. Nothing was rebuilt from scratch.

## What was merged (additive only)

From `/home/hatch/workspace/carebridge-canada/` (Sprint 0 scaffold):

| Item | Destination | Status |
|---|---|---|
| `.agents/skills/` — all 10 agent skills (carebridge-guardrails, secure-access-control, audit-and-consent, privacy-by-design, practitioner-credentialing, clinical-safety, test-engineering, accessibility-wcag, security-review, reliability-operations), each with SKILL.md | `.agents/skills/` | Implemented · Human Review Required |
| `AGENTS.md` — standing rules (only change: the stale "from-scratch build" line updated to say the premium ChatGPT-sourced build is now the main build; every rule intact) | `AGENTS.md` | Implemented · Human Review Required |
| `SECURITY.md` — security policy | `SECURITY.md` | Implemented · Human Review Required |
| `.env.example` — env template with PHI_PRODUCTION_ENABLED/PAYMENTS_ENABLED=false | `.env.example` | Implemented · Human Review Required |
| `.github/` — CI, Dependabot, PR template, Copilot instructions; `ci.yml` minimally adapted for this stack (pnpm 11.25.0, node 22, `pnpm lint`, `npx tsc --noEmit`, `node --test tests/*.mjs`, `pnpm audit`, `pnpm build`); dependabot npm → pnpm | `.github/` | Proposed (CI never ran — needs GitHub push + a real CI run) |
| `docs/architecture/` — the 27-doc Sprint 0 architecture package incl. ADR-001, threat-register, rbac-matrix, schema-draft, plus master-prompt PDF | `docs/architecture/` (new subdir; `docs/architecture.md` untouched) | Proposed · Human Review Required |
| Server-side release flags — payments gate was missing, so a minimal `lib/feature-flags.ts` was ported in this build's style (re-exports `PHI_PRODUCTION_ENABLED` from `./governance`, adds `PAYMENTS_ENABLED = false as const`, plus `EMERGENCY` refs incl. 9-8-8); test `tests/feature-flags.test.mjs` matches the node-based test convention | `lib/feature-flags.ts`, `tests/feature-flags.test.mjs` | Implemented / Tested (new test) |
| Emergency info — the ungated emergency panel in `components/carebridge/app.tsx` listed 911 and 811 but not 9-8-8; added "For mental health crisis support, call or text 9-8-8." (safety rules beat visual appearance; single sentence, premium styling unchanged) | `components/carebridge/app.tsx` | Implemented · Human Review Required |

## What was deliberately NOT merged / overwritten

- Nothing in `app/`, `components/` (except the one emergency sentence above), `lib/` (except the new
  `feature-flags.ts`), `db/`, `drizzle/`, `public/`, `package.json`, or `docs/*.md` was overwritten
  or deleted. The premium Liquid Glass UI, database foundation, MFA, scheduling, and governance
  features of this build are all preserved.
- No dependencies added (guardrail: ask before adding deps).
- Authentication, data model, and authorization logic unchanged.
- No compliance, certification, clinical-validation, penetration-testing, or production-readiness
  claims made or implied.
- No database migrations run (guardrail: ask first).
- Nothing pushed to git/GitHub.

## Verified during this merge

- PHI gate: `lib/governance.ts` hardcodes `PHI_PRODUCTION_ENABLED = false as const`; all
  catch-all `/api/**` routes return `blockedResponse()` (403 `PHI_DISABLED`) via
  `lib/release-policy.ts`. Equivalent-or-stronger server-side enforcement — not duplicated.
- Emergency info is ungated: the demo app has no login at all (role switcher is demo-only), and
  the emergency panel renders on the public Resources page without authentication.
- Target `.gitignore` already covers `.env*` — no edit needed. NOTE: it also ignores `/.agents/`,
  so the newly copied skills would be excluded from git — Eric should decide whether agent
  skills should be tracked and, if so, adjust `.gitignore`.

## Open questions for Eric

1. **Governing brief:** source `AGENTS.md` names
   `docs/architecture/CareBridge-Canada-Astra-Master-Prompt-v2.1.pdf`; target `README.md` names
   `docs/master-prompt.md`. Eric must confirm which governs going forward.
2. **Skills in git:** `/.agents/` is ignored by target `.gitignore` — track or not?
3. **CI:** the adapted workflow is Proposed only; it needs a real GitHub push + green run.
4. **Nothing is Approved.** Per guardrails, only a named human can mark items Approved; this build
   remains **synthetic-data-only and not production-ready** until formal human review and sign-off.
