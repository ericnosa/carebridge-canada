## Summary

<!-- What this PR changes and why. Link the brief section(s), e.g. §6, §28. -->

## Tests

<!-- Exact command + pass/fail counts, e.g. `npm test -- --run` → 42 passed, 0 failed. -->
<!-- Link the CI run on this PR. -->

- [ ] Unit/integration tests added or updated for the changed behavior
- [ ] Tenant-isolation test added/updated for every data-access change
      (Clinic A cannot read or write Clinic B data)
- [ ] Negative tests for each new permission (unauthorized denied server-side)
- [ ] Sensitive actions write audit events (test proves it)

## Compliance checklist

- [ ] No real personal or health data added (synthetic fixtures only, clearly labelled)
- [ ] No compliance, certification, or production-ready claims
- [ ] Emergency info (911 / 811 / 9-8-8) and patient access guarantees unaffected
- [ ] No new dependency without reason, licence, and maintenance status recorded
- [ ] No secret values committed or pasted into the PR

## Report

<!-- End every PR description with the sprint report format: -->

**COMPLETED** –
**TESTED** –
**BLOCKED** –
**NEXT** – (max 3)
