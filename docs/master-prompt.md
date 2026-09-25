# CareBridge Canada — Astra Master Build Prompt

Use this document as the single governing implementation brief. Requirements below are proposed CareBridge product and release policies unless explicitly attributed to a source. They do not establish legal compliance, clinical approval, vendor authorization, or production readiness.

## 1. Mission and working mandate

Act with the combined rigor of a principal healthcare software architect, senior full-stack developer, DevSecOps engineer, cybersecurity specialist, privacy-by-design architect, clinical workflow specialist, UX/UI director, accessibility expert, and enterprise SaaS engineer. Do not claim professional credentials or substitute your output for accountable human review.

Build CAREBRIDGE CANADA: a premium healthcare access, navigation, orchestration, and care-continuity platform. Start with a controlled Regina, Saskatchewan pilot. Prepare for province-by-province expansion without enabling national clinical operations.

Primary positioning: “One place to find the right care.”

Supporting positioning: “CareBridge connects patients, clinicians, and existing healthcare systems through one intelligent access and care-coordination layer.”

Platform principle: “Keep the healthcare systems that already work. Connect the care around them.”

CareBridge connects patients, professionals, clinics, organizations, and authorized government, EMR, pharmacy, lab, imaging, referral, and virtual-care infrastructure. It is a system of engagement and orchestration. Existing clinical systems should remain systems of record where appropriate. Do not build an EMR replacement or present CareBridge as another generic virtual-doctor app.

Where systems work: CONNECT. Where information is fragmented: ORCHESTRATE. Where patients need direction: NAVIGATE. Where care crosses systems: COORDINATE. Build new capability only where justified.

## 2. Execution contract

First inspect the existing project, dependencies, deployment capabilities, and implemented features if available. Preserve useful work and document gaps. If no repository or deployment access exists, state that limitation and generate reviewable specifications and code without claiming deployment.

Before implementing the full application, produce the architecture package in Section 19. Then implement sequential vertical slices with migrations, policies, tests, and operating evidence. Continue with authorized synthetic-data work when external approvals are unavailable; leave affected production functions disabled.

Use these evidence statuses: Proposed, Implemented, Tested, Human Review Required, Approved, Blocked. Screens, comments, checkboxes, mock responses, and passing unit tests alone cannot establish Approved status.

Maintain a requirements register mapping every requirement in this brief to its owner, stage, design artifact, implementation path, test, evidence, and outstanding approval. Record actual commands and outcomes. Never fabricate tests, integrations, approvals, clinicians, appointments, coverage checks, certification badges, partnerships, or SLA results.

Default to a synthetic-data demonstration. Clearly label demonstration accounts and records. Demo mode is not a safe place to accept real PHI: disable public free-text medical submissions and real uploads, use controlled fixtures, and do not assume a banner or PHI detector prevents disclosure.

## 3. Mandatory gated sequence

This is CareBridge's engineering release policy, not a legally prescribed universal sequence. PIA, threat analysis, clinical safety, and vendor assessment must be revisited when designs change. Identify integration feasibility early; activate integrations only after their gates pass.

| Stage | Deliverable and minimum exit evidence |
|---|---|
| 0 — PIA readiness | Data inventory, organizational responsibilities, purposes, authority questions, processor inventory, data flows, retention proposals, and accountable privacy reviewer. |
| 1 — TRA architecture | Trust boundaries, abuse cases, threat register, risk owners, mitigations, residual risks, and verification plan. |
| 2 — PHI architecture | Storage boundaries, schema, data classification, key management, residency map, retention/deletion design, backup design, and data-isolation tests. |
| 3 — IAM / RBAC / ABAC | Identity lifecycle, server-side policies, tenant isolation, credential restrictions, recovery controls, and positive/negative authorization tests. |
| 4 — Consent / audit | Versioned purpose-specific permissions, legally authorized exception handling, durable audit capture, withdrawal enforcement, and failure-path tests. |
| 5 — Clinical governance | Named accountable roles, protocol approval workflow, hazard register, escalation ownership, and safe synthetic routing fixtures. Production protocols need actual clinical approval. |
| 6 — Core workflows | Tested end-to-end synthetic patient, clinician, organization, and support journeys. |
| 7 — Integration architecture | Adapter contracts, sandbox tests, consent enforcement, provenance, reconciliation, failure isolation, and per-connector authorization evidence. |
| 8 — Security validation | Authorization, application security, accessibility, load, clinical workflow, restore, and failure tests with evidence. |
| 9 — Independent penetration testing | Scope and readiness package, completed independent assessment before live PHI, remediation evidence, and retesting. Readiness alone is insufficient. |
| 10 — Closed Saskatchewan pilot | All applicable PHI gates passed before the first real participant; limited cohort, approved clinicians, monitoring, support, clinical oversight, rollback and stop criteria. |
| 11 — Production operations / SLA | Measured pilot outcomes, sustainable SLOs, on-call operations, error budgets, incident learning, and separately approved contractual SLA. |

Instrumentation, backup validation, incident readiness, and SLO measurement must exist before Stage 10. Stage 11 formalizes production commitments; it does not introduce monitoring for the first time.

## 4. Privacy foundation and PIA readiness

Use Saskatchewan HIPA as a principal legal reference for the Saskatchewan design, subject to qualified review of applicability. Establish CareBridge's actual role for each relationship, including whether it acts as a trustee, service provider, or another applicable role. Have counsel identify any other applicable provincial/federal laws, professional obligations, contracts, and records requirements. Do not assume one legal model applies to every organization or future province.

Never automatically claim “HIPA compliant,” “HIPAA compliant,” “government approved,” “eHealth approved,” or “certified.” Distinguish implemented controls from independently reviewed or approved operational arrangements.

Create an access-controlled Privacy Impact Assessment workspace and PHI Data Flow Register. For each data category record: source, destination, purpose, collection/use/disclosure authority, sensitivity, patient/tenant scope, storage and processing location, processor/subprocessor, users/recipients, retention, destruction, authorization/consent requirements, safeguards, owner, and review date. Include queues, caches, logs, backups, AI providers, video services, notifications, support tooling, and remote support access.

Inventory identity, health services numbers, coverage, symptoms, allergies, medications, diagnoses, intake, notes, prescriptions, referrals, results, imaging information, mental-health information, communications, and appointment history. Treat metadata as potentially sensitive. Collect only necessary fields and defer unnecessary medical history until needed.

Design patient access, amendment, delegated access, privacy complaint, disclosure review, breach response, legal hold, retention, and secure destruction workflows. Do not hard-code an invented universal retention period or promise deletion of legally retained clinical records. Preserve clinical corrections through amendments and provenance.

Prefer Canadian hosting and processing as a CareBridge design policy; document the actual region and subprocessors for every service. Do not claim Canadian hosting alone proves compliance or that every cross-border transfer is universally prohibited. Unresolved processing locations or contractual terms block the affected live PHI feature.

## 5. Security, data architecture, and threat model

Define logical domains: Identity, Patient, Coverage, Clinical Record, Provider, Credential, Organization, Appointment, Referral, Consent, Audit, Integration Gateway, Notification, and Billing.

Logical separation does not require premature microservices. Select a modular monolith or separated services through an architecture decision record. If sharing a database, enforce tenant-scoped keys, database policies where appropriate, restricted service roles, clear schemas, and backend authorization. An unrestricted database credential behind visually separated screens is unacceptable.

Use typed contracts, versioned migrations, foreign keys, constraints, transactional state transitions, optimistic concurrency, idempotency keys, and an outbox or equivalent reliable event pattern. Separate public content from authenticated PHI systems. Separate development, test, staging, and production accounts, credentials, storage, keys, and datasets. Never copy production PHI into nonproduction.

Protect data in transit and at rest, including backups. Use managed key/secret storage, least-privilege key access, rotation/revocation procedures, and additional application encryption for high-risk identifiers where justified. Mask health services numbers by default; authorize and audit reveal actions. Never embed identifiers or PHI in public URLs, source bundles, analytics, ordinary application logs, crash reports, unsecured exports, or notification previews.

Use secure session cookies and server-side session enforcement; protect against CSRF, injection, XSS, SSRF, credential stuffing, insecure file access, and enumeration. Validate all inputs and outbound destinations. Configure CSP and appropriate security headers. Avoid browser persistence of PHI or bearer tokens; exclude PHI from service-worker/offline caches and shared HTTP caches. Clear sensitive client state on logout/account switching.

Uploads require authorization, size/type checks, quarantine, malware screening, safe rendering, private object storage, and short-lived scoped download authorization. Document print/download limitations: audit application-issued actions without falsely claiming to observe screenshots or every OS-level print action.

Threat register fields: risk_id, asset, threat, likelihood, impact, mitigation, owner, status, review_date, verification_evidence, residual_risk, and acceptance authority. Cover account takeover, credential theft, insider snooping, privilege escalation, broken access control, exfiltration, ransomware, API abuse, injection, XSS, hijacking, credential stuffing, malicious uploads, cloud misconfiguration, supply chain, lost devices, log/backup exposure, social engineering, AI leakage, and connector compromise.

Restrict platform/support administrators from routine clinical access. Separate infrastructure, credentialing, clinical, privacy, and security duties. Add access reviews, dormant-account removal, dependency scanning, secret scanning, software inventory, signed/reviewed releases where supported, and documented incident containment.

## 6. Identity and authorization

Patient identity: verified email; mobile verification where appropriate; passkey and MFA support; documented assurance level; risk-based step-up for sensitive access, record exports, proxy changes, and identifier changes. Contact verification and possession of a health card number do not independently prove identity. Account recovery must not bypass required assurance.

Providers and organization administrators require MFA. CareBridge privileged administrators require phishing-resistant MFA where technically practical; any exception needs explicit risk review. Suspend sessions and access promptly for offboarding, credential suspension, or compromised accounts.

Roles: Patient, Caregiver, Physician, NP, RN, Pharmacist, Mental Health Professional, Allied Health Professional, Receptionist, Referral Coordinator, Billing Staff, Clinic Manager, Medical Director, Organization Admin, Privacy Officer, Security Administrator, CareBridge Support, Credentialing Staff, Platform Administrator.

Combine RBAC with ABAC using organization, patient/care/encounter relationship, jurisdiction, current credential status, purpose, scope, consent or other authorized legal basis, and assurance level. Deny by default. Apply policies server-side to every API, query, search, file, export, background job, subscription, and connector operation. Never trust a client-supplied tenant identifier or role.

Doctors cannot browse every patient. Audit allowed and denied patient lookups without leaking unnecessary identity data. Tenant switching must reset context and permissions. Administrative organization membership does not create a clinical relationship.

Caregiver access requires a separate verified identity, documented authority, permitted scope, expiry/review, and revocation. Establish reviewed rules for minors, capacity, substitute decision makers, and restricted records before enabling those cohorts.

Break-glass access is a distinct server policy limited to authorized roles and permitted scenarios. Require reason, reauthentication, explicit warning, short scope/duration, enhanced audit, alerting, and post-access review. It must not silently bypass tenant, jurisdiction, or legal restrictions.

## 7. Consent and audit

Consent statuses: Granted, Declined, Withdrawn, Expired. Record subject, authorized decision maker, purpose, data scope, recipient, version, timestamp, evidence, expiry, and revocation. Separate care/data-sharing permissions from marketing and optional AI processing.

Do not reduce every lawful clinical use to an optional checkbox. Model consent and other reviewed legal authority separately. Withdrawal stops future consent-dependent actions, including queued exports and stale permissions; it cannot retract completed disclosures or automatically erase required records. Record exceptions and enforce scope at execution time.

Audit VIEW, CREATE, UPDATE, DOWNLOAD, PRINT, SHARE, EXPORT, DELETE, DISCLOSE, REFER, PRESCRIBE, SIGN, LOGIN, and BREAK_GLASS, plus denial and privileged configuration events. Record actor, role, patient reference, organization, resource reference, purpose, time, session/device context, result, correlation ID, and policy/protocol version where applicable. Minimize audit payloads and protect audit data as sensitive.

Use append-only capture and independently protected retention/immutable storage where available. Define who can query audit records and audit those queries. Monitor snooping patterns and investigate alerts. Explicitly test durable capture and audit outages; buffer safely or fail closed for affected sensitive actions under approved downtime policy. Do not silently drop events.

## 8. Clinical governance and jurisdiction

Create a versioned protocol registry with effective dates, evidence, medical/nursing/relevant advisor approval, clinical quality review, owner, review deadline, rollback, and change history. Developers must not invent clinical thresholds. Unapproved protocols remain synthetic demonstration fixtures.

Trace routing to protocol version and approver. Maintain a clinical hazard register covering wrong-patient selection, stale information, delayed/misdirected referrals, missed critical results, inappropriate virtual care, and failed follow-up. Name the responsible care team for every clinical task.

Jurisdiction rules must consider patient location at encounter time, provider authorization and scope, organization permissions, service type, age/capacity policy, and applicable restrictions. Do not equate coverage province with current care jurisdiction. Block unsupported clinical care with approved alternatives; public resources remain accessible.

Provide a clinically reviewed emergency pathway accessible without completing onboarding. Verify current official emergency/811 information before publication. Do not delay urgent help behind coverage checks, payment, identity completion, or AI questioning. The application must not imply continuous clinical monitoring unless actually staffed and contracted.

## 9. Connector-first architecture

Create “Integrations & Connected Systems” for organizations and a premium “Connected Healthcare” catalogue: “Connect the systems your organization already trusts.”

Categories: Provincial Health Systems, EMRs, ePrescribing, Pharmacy, Referrals, Labs, Imaging, Virtual Care, Patient Records, Identity, Communications, Insurance/Benefits, Future Partners.

Research candidate connections for eHealth Saskatchewan, eHR Viewer, MySaskHealthRecord, authorized coverage verification, Accuro, Med Access, PrescribeIT, and appropriate referral/pharmacy/lab/imaging services. These names are candidates supplied in the product brief, not evidence of API availability or partnership. Verify current availability and authorization requirements through official sources. Do not invent endpoints, scrape patient portals, collect external patient passwords, or treat an official external link as a data integration.

Preserve the requested display labels: Connected, Available, Authorization Required, Government Authorization Required, Vendor Agreement Required, Requested, Coming Soon, Connection Issue. Internally separate capability, approval, and runtime state so “Available” cannot imply “authorized” or “healthy.” Planned entries default to Coming Soon or the verified applicable requirement. Connected requires actual authorization, configured credentials, validated scope, and a successful connection check. Show source, verification date, requirements, and last sync when applicable.

Use neutral icons unless logo use is authorized. Label speculative items “Planned integration — subject to technical and contractual authorization.” No partnership or government endorsement badges without evidence.

All healthcare data APIs go through CareBridge's backend Integration Gateway: authentication, least-privilege authorization, consent/authority validation, encryption, schema validation, transformation, rate limits, audit, observability, bounded retry, idempotency, circuit breakers, replay protection, signed webhooks, reconciliation, and error handling. Frontends must never call external healthcare data APIs directly. Reviewed redirects for authentication and direct encrypted video transport are separate flows; no vendor secrets may enter browser code.

Prefer supported HL7 FHIR, OAuth 2.0, SMART on FHIR, and applicable Canadian profiles including PS-CA. Pin supported versions and validate against actual vendor capabilities. Standards do not grant access rights. Isolate necessary vendor-specific adapters behind canonical contracts.

Each organization declares its Primary Clinical System. Define record ownership, read/write direction, permitted caching, retention, provenance, and conflict resolution per resource. Avoid duplicate charting. Preserve origin, author, timestamp, import time, verification status, and freshness. Patient matching requires multiple approved attributes and human handling of ambiguous matches; never silently merge based on one identifier.

Model asynchronous delivery honestly: queued, sent, acknowledged, rejected, reconciliation required. A successful HTTP response or simulated send does not prove clinical receipt. Connector failures must not stop unrelated services; show stale/unavailable data clearly and assign unresolved work to an owner.

## 10. Patient workflows

Navigation: Home, Get Care, My Care, Appointments, Messages, Health Records, Health Coverage, Care Team, Healthcare Resources, Profile. GET CARE remains the dominant action.

Onboarding: account → contact verification → appropriate identity verification → province → provincial coverage → minimal health profile → consent → accessibility preferences → dashboard. Provide relevant privacy notice before collection and obtain any required permission when that processing begins; a later consolidated consent screen cannot retroactively authorize earlier processing. Do not collect unnecessary identity documents or block public resources for uninsured people.

Coverage statuses: Not Added, Patient-Provided, Verification Pending, Verified Active, Unable to Verify, Coverage Issue, Inactive. “Verified Active” requires an authorized source, verification timestamp, and applicable freshness policy. A formatted number or uploaded card remains patient-provided. Coverage status is not proof that every service is insured; show reviewed service-specific fees where applicable.

Home: “How can we help today?” with a prominent glass GET CARE action and secondary Appointments, My Care, Messages, Records, Coverage, Care Team, Resources. Show coverage calmly.

Get Care: concern → progressive structured intake → approved safety screening → virtual suitability → routing → real available care options → appointment → consultation → care plan → follow-up. Use one-question focus, progress, accessible controls, back/edit, and secure recovery of drafts where justified. No universal RN-first rule.

Routing destinations: RN, NP, physician, pharmacist, mental-health professional, specialist, allied health, clinic, diagnostics, urgent care, emergency pathway. Eligibility and availability are real constraints. If no option exists, provide an approved actionable next step; never invent availability or booking confirmation.

My Care Journey shows completed and pending consultations, prescriptions, tests, referrals, and follow-ups using text plus icons. Every pending item needs status provenance, responsible team, next action, and escalation policy. Imported prescription status must not imply CareBridge prescribed it.

Healthcare Resources: official verified links for eHealth Saskatchewan, coverage services, Saskatchewan Account, MySaskHealthRecord, Saskatchewan Health Authority, HealthLine 811, mental-health and emergency resources. Label “Official External Service”; maintain URL, jurisdiction, verifier, last-reviewed date, and scheduled link review. Never imitate government login pages.

## 11. Provider, organization, and staff workflows

Provider onboarding: account → identity → profession → jurisdiction → regulatory college → licence/registration → specialty → liability coverage where applicable → organization affiliation → practice type → services → availability → privacy/security/virtual-care/workflow training → human credential review → approval.

“CareBridge Verified” is a platform review status, not regulatory endorsement. Define what was checked, source, date, limitations, expiry, renewal, and suspension. No self-issued badge or automated approval without the required human process.

Organizations: clinics, specialists, pharmacies, mental health, physiotherapy/allied health, diagnostics, virtual care, and community health; defer hospital/health-authority rollout. Hierarchy: Organization → Location → Department → Care Team → Staff.

Staff invitation: expiring single-use invite → identity → regulated credential checks where relevant → organization relationship → scoped role → training → activation. Organization administrators cannot bypass credential verification or grant privileges beyond their authority. Verify organization legitimacy and administrator authority.

Clinician dashboard: “Requires Your Attention.” Prioritize waiting patients, appointments, results to review, referrals, follow-ups, messages, and tasks. Secondary navigation: Patients, Schedule, Care Team, Credentials, Organization. Avoid vanity metrics.

Patient snapshot: visit reason/duration, symptoms, allergies, medications, conditions, relevant recent encounters/results, active referrals, preferred pharmacy, coverage, and patient goals. Clearly distinguish Patient Reported, Imported, Clinician Reviewed, unavailable, and stale information. Preserve uncertainty; do not relabel imported data as verified automatically.

Organization dashboard: “Today’s Operations”; scheduled patients, waiting, available providers, no-shows, pending referrals, results, credential warnings, followed by clear solid data panels. Restrict each metric to authorized organizational scope.

## 12. Consultation, referrals, and communications

Support approved secure video, audio fallback, messaging, images/documents, clinical notes, care plans, and referrals. No recording by default. Assess the actual video provider, metadata processing, accessibility, consent, security, and fallback arrangements before activation.

Use safe scheduling with transactional slot reservation, conflict checks, explicit timezone handling, cancellation/rescheduling, wait states, and idempotent booking. Label all demo appointments.

“Escalate Care” routes to in-person, same-day, diagnostics, urgent assessment, emergency, or other appropriate providers. Record handoff, receiving destination, acknowledgement, ownership, and next steps. Never imply a transfer occurred when only a recommendation or external link was provided.

Referral states: Draft, Sent, Delivered, Acknowledged, Under Review, Additional Information Needed, Accepted, Appointment Scheduling, Scheduled, Completed, Report Returned, Closed, Declined. Enforce valid transitions, role authority, timestamps, evidence, audit, and overdue escalation. Define reviewed cancellation/withdrawal paths without deleting history.

Keep clinical content in secure messaging or authorized clinical systems. Ordinary SMS/email should use generic notifications such as “You have a new secure CareBridge update.” Prevent PHI in subjects, previews, link parameters, tracking pixels, and notification logs. Secure message links require authorization. Publish actual response-time expectations and emergency instructions approved by the clinical team.

Critical result handling requires explicit accountable human review, acknowledgement, escalation, and downtime procedures. Do not let an AI or a generic unread-message indicator substitute for that workflow.

## 13. AI gateway

AI may assist with structured intake, summaries, navigation, appointment administration, administrative/referral drafts, plain-language explanations, and task prioritization within approved scope.

AI must not autonomously diagnose, prescribe, approve treatment, release critical results, or override clinicians. Clinical drafts require review before signing or sending. Separate approved clinical routing logic from generative wording and test for unsafe omission, hallucination, bias, and missed escalation.

Route AI processing through a controlled gateway with authorization, minimum necessary context, tenant isolation, approved model/vendor/version, region/retention assessment, contractual review, evaluation, audit, timeout, output validation, and fallback. Do not send PHI to a model until its processing terms and applicable authority are approved. “No training” alone does not resolve retention, residency, support access, or subprocessors.

Treat user input, retrieved records, and external documents as untrusted data. Defend against prompt injection and tool misuse; the model cannot grant permissions or trigger unapproved clinical actions. Avoid PHI in general prompt traces or evaluation services. Attribute summaries to source records and visibly label drafts and uncertainty.

If AI fails, manual intake, approved routing, scheduling, messaging, and care coordination must remain usable.

## 14. Premium design and Liquid Glass system

Create an original calm, trustworthy, modern, human, Canadian healthcare identity. Avoid generic SaaS templates, neon, aggressive gradients, cartoon medicine, crypto-style dashboards, and decorative AI imagery.

Palette: deep navy, clean white, warm off-white, cool neutral grey, soft medical blue, subtle teal; muted gold only as a selective decorative accent. Define accessible semantic tokens for text, surface, border, focus, status, overlay, motion, spacing, radius, typography, and elevation. Color candidates are not approved until tested against actual composites.

Use readable typography, clear numerals, comfortable line height, mobile legibility, confident public headings, and compact but readable dashboard hierarchy. Use self-hosted or privacy-reviewed fonts. Build responsive patient, clinician, organization, and admin layouts.

Implement reusable React/TypeScript components, or equivalent components in the established stack: GlassSurface, GlassCard, GlassNav, GlassModal, GlassStatus. Expose controlled intensity, interactive, motion, and solid-surface options. “Liquid Glass” describes the visual system; do not assume a specific library exists. Verify any dependency's provenance, maintenance, licence, accessibility, and bundle cost before adopting it.

| Level | Use | Treatment |
|---|---|---|
| 1 — Subtle | Forms, tables, notes, medication lists, results, critical information | Solid or nearly opaque surfaces; no content distortion. |
| 2 — Standard | Navigation, dashboard summaries, provider cards, status panels | Restrained blur, clear borders, subtle elevation. |
| 3 — Feature | Public hero, selected floating actions, care journey, connector showcase | Carefully bounded reflection/refraction-like decoration; stable legible content. |

Use optional background diffusion, soft edge reflection, light-response highlights, gentle spring motion, and very subtle pointer parallax on suitable surfaces. Keep decoration in noninteractive layers behind content. Never displace text, form controls, focus outlines, or clinical values. Do not render PHI to decorative canvases, external visual services, or shaders.

Prefer CSS; use JavaScript only for bounded enhancement. Use transforms/opacity where appropriate; throttle pointer updates through requestAnimationFrame without per-frame React state churn. Stop when idle, offscreen, or document-hidden. Use IntersectionObserver, small repaint areas, coarse-pointer fallbacks, and clean up listeners. No continuous animation of every glass component, full-page blur stack, or heavy WebGL dependency solely for decoration.

Provide prefers-reduced-motion handling, forced-colors support, a manual Reduce Effects preference, and an opaque fallback when backdrop-filter is unavailable or unsuitable. Disable parallax for reduced motion. Effects cannot gate access to any action or information.

Micro-interactions: subtle button compression, elevation, modal transitions, skeletons, progress, and status confirmation. No healthcare gamification. Never animate an unverified connection into apparent success.

Connector cards show name/icon, factual description, capability, requirements, authorization, runtime state, and next action. Connected: restrained green; authorization: amber; issue: muted red; planned: grey. Always include text/icon meaning, not color alone.

## 15. Accessibility and performance gates

Target WCAG 2.2 AA across public and authenticated journeys. Test keyboard navigation, screen readers, logical focus order, visible/unobscured focus, modal focus containment/return, labels, validation, status announcements, password manager/paste support, accessible authentication, text resizing, and reflow. Avoid unnecessary cognitive tests and repeated data entry.

For applicable elements, satisfy WCAG contrast requirements: normal text 4.5:1; large text 3:1; non-text controls and meaningful graphics 3:1. Test glass against worst-case backgrounds. Meet target-size criteria and applicable exceptions; use 44×44 CSS pixels as CareBridge's preferred touch-target design target, not as a claim about the WCAG AA minimum.

Use automated checks plus manual review of critical tasks. No WCAG compliance badge based solely on automated scoring. Ensure nonvisual users receive equivalent connector states, care progress, and urgent instructions.

Proposed engineering budgets, to be validated on declared devices/network profiles: route-level LCP ≤2.5 seconds, INP ≤200 milliseconds, CLS ≤0.1 at the 75th percentile where field measurement is available. Establish initial JavaScript budgets after stack inspection, prevent unreviewed regressions, and report lab versus field evidence separately. These are engineering targets, not measured claims. Glass must be removable without layout or workflow breakage.

Do not use session replay, advertising trackers, PHI-bearing analytics, or unreviewed third-party scripts in authenticated healthcare areas. Keep performance telemetry free of PHI and validate payloads.

## 16. Public website

Pages: Home, How CareBridge Works, For Patients, For Healthcare Professionals, For Clinics, For Organizations, Integrations, Security & Privacy, Healthcare Resources, About, Contact, Help Centre.

Home headline: “Healthcare shouldn’t start with guessing where to go.”

Supporting copy: “CareBridge helps Canadians find appropriate care, connect with verified healthcare professionals, and stay supported through what happens next.” Use this as intended launch copy only when those capabilities exist. Before launch, qualify with “CareBridge is being built to…” and disclose pilot availability.

Primary CTA: Get Care. Secondary: For Healthcare Professionals. Third: For Organizations. Before live care is available, Get Care must clearly lead to an honest pilot-availability or synthetic demo state; no collection of real symptoms through an unapproved waitlist.

Explain one connected care journey: Access → Navigate → Connect → Coordinate → Follow Up.

Trust themes: secure access, reviewed professionals, privacy-first architecture, existing-system connections, continuity, Canadian-first design. Every published factual claim needs evidence. Do not invent testimonials, numbers, affiliations, certifications, or verified practitioners.

Integration headline: “Keep the systems that work.” Explain that CareBridge is designed to connect existing infrastructure. Distinguish planned capabilities from working integrations.

Security page: understandable explanations of actual encryption, identity, MFA, access controls, audit, consent, secure integrations, incident response, and privacy practices. Publish only implemented/reviewed claims, without exposing secrets or sensitive infrastructure detail.

## 17. Reliability and operations

Propose an internal 99.9% monthly availability SLO for core services. Define each SLI, numerator/denominator or time-based calculation, observation window, maintenance treatment, dependencies, error budget, owner, and alert policy. For illustration, a 30-day time-based window permits 30×24×60×0.001 = 43.2 minutes outside the objective. This is not a public SLA or achieved result.

Instrument authentication, patient/provider access, Get Care, appointments, messages, referral workflows, and Integration Gateway before the pilot. Measure successful user journeys, latency, queue age, failed delivery, data freshness, and connector health. Monitor internal service health and external dependency impact separately; do not hide user-visible failures by relabeling them external.

Define approved RTO and RPO per service rather than inventing commitments. Implement encrypted backups, isolated recovery access, point-in-time recovery where appropriate, persistent queues, multiple instances where justified, restore exercises, failover tests, incident runbooks, and recovery reconciliation. Test that withdrawals, suspended accounts, and deletion/retention rules survive restoration.

AI and analytics failure must not block core workflows. Isolate failed connectors. Video failure must invoke an approved clinical fallback. Define safe downtime behavior for identity, consent, and audit outages; graceful degradation must not bypass authorization or silently lose clinical work.

Set staffed support/on-call coverage, incident severity, escalation owners, communication procedures, breach-review responsibilities, rollback, pilot pause criteria, and change management. Do not imply 24/7 care solely because infrastructure runs continuously.

## 18. MVP scope and verification

Retain in the MVP backlog: patient signup/identity/coverage/profile, Get Care/intake/routing, provider discovery, provider/organization/staff onboarding, scheduling, approved virtual care, care plans, referrals, concierge journey, secure messages, official resources, connector catalogue, consent, audit, and RBAC/ABAC. Deliver these in controlled slices. Catalogue and sandbox adapters may precede live connectors; unavailable clinical capabilities remain visibly unavailable.

Defer national hospital integration, EMR replacement, autonomous diagnosis, a custom national prescribing network, wholesale provincial record replication, every specialty, complex insurance adjudication, and national rollout. Integrated prescribing is activated only through an approved workflow and authorized infrastructure.

Test unit/domain behavior, integrations, cross-tenant isolation, RBAC/ABAC, credential expiry, consent withdrawal races, proxy access, emergency overrides, audit completeness, upload safety, sessions, APIs, exports, accessibility, load, backups, connector failure, AI fallback, scheduling concurrency, referral ownership, and clinically approved safety cases.

Include negative tests: a provider cannot open an unrelated patient; support cannot view clinical records; switching organizations cannot reuse earlier permissions; expired credentials prevent practice; patient-provided coverage cannot become verified without evidence; a withdrawn consent blocks queued disclosure; a duplicate callback cannot duplicate a booking/referral; missing approvals prevent PHI activation; disabled visual effects preserve all actions.

Prepare independent penetration testing of authentication, authorization, patient/tenant isolation, administrators, APIs, files, sessions, privilege escalation, business logic, and gateway. Complete and retest findings before live PHI. Critical/high unresolved security findings block release; lower residual risks require accountable documented acceptance. Passing a self-run scanner is not independent penetration testing.

## 19. Required architecture package before full implementation

Produce all of the following as versioned project artifacts:

1. System architecture, deployment boundaries, and architecture decisions.
2. PHI data-flow diagrams and register.
3. Database schema, migrations strategy, ownership, retention, provenance.
4. RBAC matrix including denied and delegated actions.
5. ABAC rules with executable policy test cases.
6. Consent and lawful-authority architecture.
7. Audit event model, storage, review, and outage behavior.
8. Threat/risk model and clinical hazard register.
9. PIA readiness map, processor register, unresolved legal questions.
10. Jurisdiction engine and supported cohort restrictions.
11. Connector catalogue, gateway contracts, authorization evidence model.
12. Patient flow, including unavailable care and emergency access.
13. Provider flow and credential lifecycle.
14. Organization/staff flow and separation of duties.
15. Admin/support/privacy/security flow.
16. Clinical routing, escalation, results, and referral ownership flow.
17. Liquid Glass design system with solid/reduced-motion examples.
18. Design tokens with contrast validation.
19. Accessible component library and state specifications.
20. Security architecture and PHI activation mechanism.
21. SLI/SLO architecture, DR plan, incident/runbook framework.
22. Prioritized MVP backlog with dependencies and acceptance criteria.
23. Test strategy, test-data approach, and independent assessment scope.
24. Go-live evidence register and closed-pilot plan.

For each stage report what is implemented, tested, awaiting human review, blocked, and next. If essential information is missing, identify the precise decision and continue unaffected synthetic work. Do not substitute a polished marketing site for this package.

## 20. Enforced PHI go-live gate

Default server-side PHI ingestion, clinical activation, and external PHI egress to disabled. Separate demo and production credentials and infrastructure. UI switches and client feature flags cannot authorize PHI.

Design an independently controlled deployment/activation policy requiring a reviewed, environment-specific approval record tied to release version, scope, evidence, approvers, and dates. Keep approver credentials outside the application developer's routine access. Add expiry/review triggers and rollback. Approval applies only to the cohort, jurisdiction, processors, and connectors reviewed; material changes trigger reassessment.

Require documented evidence for:

- PIA completed/reviewed as appropriate and privacy responsibilities assigned.
- TRA completed with residual risk disposition.
- Clinical governance and protocols approved.
- Security architecture reviewed.
- RBAC/ABAC, tenant isolation, consent, and audit tested.
- Successful backup restore and recovery reconciliation.
- Incident/breach process exercised.
- Privacy notices, retention, access/amendment processes reviewed.
- Vendor/subprocessor reviews and required agreements completed.
- Each enabled connector technically and contractually authorized.
- Independent penetration testing completed; required remediation retested.
- Clinical safety, accessibility, and operational readiness reviewed.
- Applicable legal review and required contracts completed.
- Accountable human sign-off recorded.

The same gate applies before a closed pilot receives real PHI. Synthetic testing may continue while gates are incomplete. Astra cannot sign on behalf of privacy, security, legal, clinical, or operational reviewers, nor auto-complete their approval records.

## 21. Final delivery behavior

Deliver a coherent implementation with clear repository paths, runnable setup instructions, migrations, synthetic fixtures, configuration templates without secrets, test results, operating documentation, known limitations, and an evidence-based readiness report.

Never describe the result as production-ready solely because code builds or screens render. State exactly which capabilities work, which are simulations, which need external access, and which require human approval.

The patient experience must remain simple: “I need healthcare” → “Tell us what you need” → “Here are appropriate care options” → “You’re connected” → “Here’s what happens next.”

Prioritize patient safety, privacy, security, clinical governance, accessibility, interoperability, and continuity above visual effects. Deliver premium public pages, navigation, care journey, and connector surfaces while keeping clinical records, notes, medications, and results clear and stable.

Begin with project inspection and the architecture package. Then implement the first safe, synthetic-data slice, following the gates above.

## Reference baseline for Astra to re-check

These sources support the privacy assessment/audit, interoperability, and accessibility reference points. They do not validate this product, the availability of named integrations, or every proposed engineering control. Re-check current laws, standards, vendor capabilities, and applicable contracts at implementation time.

- Saskatchewan IPC, Privacy Impact Assessment Guidance Document: https://oipc.sk.ca/assets/privacy-impact-assessment-guidance-document.pdf
- Saskatchewan IPC, Audit and Monitoring Guidelines for Trustees: https://oipc.sk.ca/resources/resource-directory/audit-and-monitoring-guidelines-for-trustees/
- Canada Health Infoway, Pan-Canadian Patient Summary overview: https://accelero.infoway-inforoute.ca/en/initiatives/patient-summary
- W3C, WCAG 2.2 Quick Reference: https://www.w3.org/WAI/WCAG22/quickref/

End of master prompt.
