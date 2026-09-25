# Validation - synthetic preview

Passed before publishing:
- TypeScript no-emit check.
- Immutable release policy: PHI false, live care false, live connectors zero.
- Deny response: 403, PHI_DISABLED, Cache-Control no-store.
- Browser: dashboard renders, guided sample concern progresses through three steps, sample slot selection reaches confirmation, selection carries across routes, rescheduling changes in-memory appointment and closes dialog.
- Browser: main landmark nesting removed; icon-only section links labelled; progressbar labelled.

Limitations:
- No independent penetration test, formal accessibility audit, clinical safety validation, load test, backup restore, or production IAM test. No clinical infrastructure is provisioned.
- Responsive CSS and reduced-motion/solid fallbacks implemented; no device-matrix verification or field performance measurements.
- Demo activity is ephemeral, not tamper resistant.
- CSP allows framework inline scripts; production must review nonce/hash strategy and actual hosting behavior.
- WebMCP/readiness and connector checks recorded in final workflow results when performed; do not infer tests from this checklist.

No live PHI is authorized by these checks.

Additional checks:
- Browser: workspace switch reaches Today’s Operations; Connected Systems opens the connector catalogue; Accuro detail explicitly reports disabled runtime/authorization requirements; recording demo interest changes the control to a disabled confirmation without external transmission.
- WebMCP validation unavailable: browser reported modelContext unavailable. Registration is feature-detected and has no impact on ordinary UI.
