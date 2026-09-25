# Source checkpoint — 2026-09-25

Full source snapshot, including unfinished local changes. Synthetic data only; PHI_PRODUCTION_ENABLED remains false.

Last published source commit: 37fcd9bf3b64c515646a3bf980a8c7020805916e.
The README predates the foundation work; use source and tests for current behavior.

Unpublished work includes MFA/passkey/TOTP/recovery, synthetic demo provisioning, scheduling, governance schema and consolidated readiness. These changes have NOT completed integrated verification or deployment.

Outstanding: install and lock @simplewebauthn/server and @simplewebauthn/browser (implementation targets 13.3.0); run MFA/full authorization tests, typecheck and build; complete architecture package and clinical registry UI; validate demo flows. Scheduling suite previously passed 11 tests, but subsequent edits have not been retested.

Runtime configuration is excluded. Configure MFA_ENCRYPTION_KEY securely, CAREBRIDGE_ORIGIN and SYNTHETIC_DEMO_ENABLED through the hosting environment. Never commit secret values. Database migrations are included; live database contents and sessions are excluded. Hosting remains Sites/Cloudflare-specific and requires its bindings and authentication context.

Excluded: dependencies, generated build/cache outputs, Git metadata, environment secrets, runtime data. Existing source, migrations, tests, documentation and assets are preserved.
