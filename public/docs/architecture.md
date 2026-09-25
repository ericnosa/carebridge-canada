# CareBridge Canada - Architecture and readiness package
Release scope: private synthetic-data demonstration. No patient accounts, PHI database, live routing, live consultations or external clinical integrations are enabled. Platform controls below are designs unless explicitly marked implemented. Production is BLOCKED.

## 1. System architecture
Implemented: React/TypeScript browser experience served through a Cloudflare-compatible Worker. Only bundled synthetic fixtures and browser-memory demo state. The Site access perimeter is not healthcare IAM. All /api/** reads/writes are denied with 403, except the non-sensitive readiness endpoint. No D1, R2, AI, clinical or messaging capabilities configured. Proposed production boundary: browser -> authenticated BFF -> authorization policy -> domain modules -> scoped storage/outbox; gateway is the only external clinical egress path. ADR: use modular monolith initially; isolate audit and integration credentials operationally. Production vendor/residency assessment is unresolved.

## 2. PHI data flows
Production collection/processing/egress disabled. Demo: bundled fixtures -> browser memory -> reset on reload. No free text, document uploads or external messages. Future register must include identity, coverage, symptoms/intake, allergies/medications, diagnoses/notes, appointments, messages, prescriptions, referrals/results, consent, audit, files, logs, backups, AI and video metadata. For each require source, destination, purpose, authority, processor/region, scope, retention, owner and approval evidence. No approved authority, retention period or processor is presumed.

## 3. Database schema
Proposed, not migrated: organization(id,jurisdiction), location(id,organization_id), department(id,location_id), membership(user_id,organization_id,role,status), patient(id), identity(user_id,assurance), proxy(patient_id,actor_id,authority,scope,expiry), credential(provider_id,jurisdiction,status,source,expires_at), relationship(patient_id,organization_id,provider_id,scope), coverage(patient_id,status,source,verified_at), encounter(id,patient_id,organization_id,status,protocol_version), appointment(id,organization_id,patient_id,slot_id,status,version), record(id,patient_id,organization_id,type,origin,author,source_time,version), referral(id,patient_id,organization_id,state,owner,version), task(id,encounter_id,owner,due,state), consent(id,patient_id,purpose,recipient,scope,version,status), audit(id,actor,resource,purpose,result,correlation,time), integration(id,organization_id,capability,approval,health), outbox(id,tenant_id,resource_id,consent_version,idempotency_key,state), approval(id,release,environment,scope,approver,evidence,expires_at). Composite tenant foreign keys, server-side policy, database isolation, encrypted identifiers and unique slot/idempotency constraints required. Amend signed clinical records rather than overwriting. Retention and deletion subject to reviewed policy.

## 4. RBAC matrix
Patient: own authorized records/appointments/messages. Caregiver: explicit proxy scope only. Physician/NP/RN/Pharmacist/Mental Health/Allied Health: current credential, scope, organization and legitimate relationship required. Receptionist: scheduling/demographics only. Referral Coordinator: assigned referral scope. Billing Staff: minimum necessary billing only. Clinic Manager/Organization Admin: organizational operations, no automatic chart access. Medical Director: authorized clinical governance. Privacy Officer: scoped investigations/audit. Security Administrator: security metadata, no routine PHI. CareBridge Support: metadata only. Credentialing Staff: professional documents, no charts. Platform Administrator: infrastructure, no routine clinical access. No production policy implemented in this demo: all APIs deny all roles.

## 5. ABAC
Proposed allow = authenticated AND current assurance AND active membership AND same permitted tenant AND authorized purpose AND valid relationship/proxy AND active credential/scope when required AND permitted jurisdiction AND consent or reviewed other authority. Client role is never trusted. Deny by default across objects, files, jobs, exports and gateway. Test every predicate independently, denied cross-tenant lookups, credential expiry, session revocation and consent races.

## 6. Consent
Version subject, decision maker, purpose, recipient, scope, authority, effective/expiry dates and withdrawal. States Granted/Declined/Withdrawn/Expired. Separate marketing, care, AI and sharing. Re-check permissions when queued work executes. Withdrawals stop future dependent processing; do not erase legally retained charts or retract completed disclosures. Demo switches change browser memory only.

## 7. Audit
Production append-only durable event pipeline -> restricted immutable retention with independent access -> investigation workflow. No raw PHI in payload. actor/role, patient/resource references, tenant, purpose, time, session context, result, policy/protocol version, correlation. Sensitive allowed/denied reads and all mutations, downloads, disclosures, signing, login, emergency overrides audited. Proposed outbox/durable capture and fail-closed policy on loss of capture. Demo events are ephemeral and explicitly not a compliant audit trail.

## 8. Threat model and hazards
Register format: id,asset,threat,likelihood,impact,mitigation,owner,status,review_date,evidence,residual_risk. Open high risks: account takeover/credential stuffing (MFA/recovery); cross-tenant/relationship bypass (policy + isolation tests); insider snooping (relationship restriction + audit review); injection/XSS/SSRF/API abuse (validation/CSP/egress controls); malicious uploads (quarantine/scanning); cloud/secrets/backup exposure (restricted keys/restore); ransomware (isolated recovery); supply-chain compromise (dependency/release checks); social engineering/lost devices (training/session revocation); AI leakage/prompt injection (gateway/no PHI until reviewed); connector compromise (scopes/isolation/reconciliation). Clinical hazards: wrong patient, stale result, unsafe triage, missed critical result, orphan referral, duplicate appointment, failed handoff. No independent assessment or clinical safety approval yet.

## 9. PIA readiness
CareBridge legal role and trustee/service-provider relationships TBD by counsel. Data minimization, need-to-know, notices, access/amendment, proxy, retention, breach, processor contracts and residency need review. Canadian hosting is a proposed preference, not verified platform processing or proof of compliance. All PHI processing blocked pending assessments. No regulatory certification claims.

## 10. Jurisdiction
Proposed rules use patient actual encounter location, provider authority/scope, organization, service, cohort and reviewed provincial restrictions. Coverage province is not encounter location. Saskatchewan adult pilot only after reviewed cohort rules. Other provinces and minors clinical flows disabled. Public resources remain available.

## 11. Connector architecture
Candidate catalogue only; no active partnerships, credentials or APIs. Separate capability (planned/sandbox/ready), approval (missing/approved/revoked), runtime (disabled/healthy/error). Gateway authenticates, authorizes, validates authority/schema, transforms, audits, retries with bounds/idempotency, reconciles, isolates failure, verifies webhooks. Pin supported FHIR/SMART/PS-CA versions only when vendor support confirmed. EMR system of record; preserve provenance and freshness; human review for ambiguous identity matching. Connected requires actual authority + tested connection.

## 12. Patient flow
Dashboard -> select fixed synthetic concern -> approved-scenario demonstration -> synthetic care options -> select demo slot -> demo appointment -> journey. No real care, symptoms or account creation accepted. Live flow later requires identity, coverage, minimum profile, consent at collection, accessibility preferences, clinical safety and real appointment inventory. Resources/emergency information accessible without onboarding.

## 13. Provider flow
Demonstration of account/identity/profession/jurisdiction/college/licence/liability/organization/services/availability/training/review. No uploads or applications submitted. Live verification requires accountable reviewer and authoritative sources with expiry/suspension. A demo profile is never a verified provider.

## 14. Organization flow
Organization -> location -> department -> team -> staff. Demo operational overview and onboarding checklist. Future invitations are expiring/single-use, verify identity/authority and regulated credentials; admins cannot override credentialing.

## 15. Admin flow
Read-only readiness and ephemeral demo activity. No PHI activation switch, real privilege changes or production approval forms. Future privacy/security/clinical roles separated; dual-controlled release approvals independent from routine developers.

## 16. Clinical routing
Synthetic scenario fixtures are demonstrations, not triage protocols or advice. No inferred diagnoses or severity rules. Future registry version/effective date/approver/review deadline and rollback; jurisdiction/eligibility/safety -> legitimate options -> clinician accountable for care -> acknowledged handoff -> owned follow-up. Break-glass needs policy, reason, reauthentication, expiry, alert and review. No demo emergency override that grants real access.

## 17. Liquid Glass
Shared GlassSurface, GlassCard, GlassNav, GlassModal, GlassStatus. Bounded CSS blur/edge reflection and one-frame pointer updates on decorative surfaces. Never render PHI into canvases. Clinical content opaque. Respect reduced motion and forced colors; manual Reduce Effects preference. No continuous loops or third-party visual scripts.

## 18. Design tokens
Navy #132f41, teal #146f68, pale aqua #e8f4f2, warm white #f7f9fa, slate #586976. Body >=16px, labels >=14px, secondary >=12px. Solid text backing, visible focus, roomy controls. Contrast needs manual/automated evaluation before accessibility conformance claim. No such claim in demo.

## 19. Component library
Existing accessible sidebar, dialog, select, switch, tabs, progress and tables composed with original theme. Reusable status tags, task rows, journey timeline, care cards, provider cards, connector cards, empty/error and confirmation states. Semantic buttons, labels, keyboard navigation, status announcements. Responsive mobile drawer and single-column cards.

## 20. Security architecture
Implemented scope restriction: fixed fixtures, no PHI inputs/uploads, no external clinical/AI calls, no clinical data persistence, no credentials, API 403 deny policy and no production bindings. NOT implemented: production patient authentication, MFA, tenant data stores, consent enforcement, tamper-resistant audit, encryption key lifecycle or DR. Production requires independent reviewed environment and activation evidence; a UI state cannot authorize it.

## 21. Operations
99.9% internal SLO is proposed only; no public SLA. Observe auth, care, appointment, messages, referrals and gateway end-to-end success/latency. RTO/RPO per service await accountable approval. Before real pilot: encrypted backups/restore, consent/deletion replay, persistent queues, on-call, incident/breach exercise, graceful degradation without authorization bypass, rollback/stop policy. Current demo has no clinical operations or availability promise.

## 22. MVP backlog
P0 privacy/legal roles, PIA/TRA, real hosting/vendor assessment, human governance. P1 identity/authorization/data isolation, consent/audit. P2 clinical protocol approval and credentialing. P3 patient/clinician workflows integrated with authorized scheduling/video/messaging. P4 sandbox/contracted connectors and reconciliation. P5 independent security/accessibility/clinical safety/recovery/load validation. P6 limited Regina pilot only after sign-off. Synthetic UI delivers navigation/workflow usability exploration while every live dependency remains blocked.

## 23. Test strategy
Current: type/build checks, API rejection/readiness assertions, route rendering and synthetic workflow checks where preview available. Production pending: unit/integration, RBAC/ABAC/cross-tenant, credential expiry, proxy/consent races, durable audit, uploads/session abuse, scheduling concurrency, connector failures, clinical scenarios, accessibility/manual screen reader, load, backup restore, independent pentest/retest. Do not interpret a passing build as security certification.

## 24. Go-live gate
All remain Human Review Required/Blocked: PIA, TRA, clinical governance, architecture review, IAM tests, consent/audit, backup restore, incident exercise, policies, vendors, necessary connector contracts, independent penetration test/remediation, clinical safety, legal/contracts, accountable approval. Approval tied to release/environment/jurisdiction/cohort/processors. No real PHI in a closed pilot before the same gate passes. No developer may self-approve third-party/legal/clinical reviews.
