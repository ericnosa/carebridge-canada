import {Foundation} from './foundation';
import {type D1Database} from './d1-database';
import {encrypt} from './totp';
export const DEMO_ORG='synthetic-demo-org';
export const DEMO_USER='synthetic-demo-privileged';
export const DEMO_SECRET='JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP'; // Public fixture, never a production credential.
export async function demoLogin(db:D1Database,key:string,workspace='privileged'){
 const now=Date.now();const statements=[
 db.prepare("INSERT OR IGNORE INTO organizations(id,created_at,name,status) VALUES(?,?,'SYNTHETIC DEMO ONLY','active')").bind(DEMO_ORG,now),
 db.prepare("INSERT OR IGNORE INTO users(id,created_at,subject,status) VALUES(?,?,?,'active')").bind(DEMO_USER,now,DEMO_USER),
 db.prepare("INSERT OR IGNORE INTO memberships(id,created_at,organization_id,user_id,role,status) VALUES('synthetic-demo-membership',?,?,?,'System Administrator','active')").bind(now,DEMO_ORG,DEMO_USER),
 db.prepare("INSERT OR IGNORE INTO mfa_factors(id,user_id,kind,secret,active,created_at) VALUES('synthetic-demo-totp',?,'totp',?,1,?)").bind(DEMO_USER,await encrypt(DEMO_SECRET,key),now),
 db.prepare("INSERT OR IGNORE INTO protocol_registry(id,organization_id,version,effective_from,owner,approval_status,review_date,change_history,label) VALUES('demo-protocol',?,1,?,'Synthetic governance owner','Human Review Required',?,'Initial synthetic fixture; no clinical use','Synthetic fixture — not clinically approved')").bind(DEMO_ORG,now,now+2592000000)
 ];
 const hazards=[['wrong-patient selection','Similar identifiers','Wrong care recipient','Confirm two identifiers'],['stale data','Delayed synchronization','Decision based on outdated information','Show source and freshness'],['missed follow-up','Task not assigned','Care delay','Assign owner and due date'],['misdirected referral','Wrong recipient','Disclosure or care delay','Verify destination before sending'],['missed critical result','Notification failure','Delayed urgent action','Acknowledgement and escalation workflow']];
 for(const [hazard,cause,effect,mitigation] of hazards)statements.push(db.prepare("INSERT OR IGNORE INTO clinical_hazards(id,organization_id,hazard,cause,effect,mitigation,owner,status,review_date) VALUES(?,?,?,?,?,?,'Synthetic governance owner','Human Review Required',?)").bind('demo-'+hazard.replaceAll(' ','-'),DEMO_ORG,hazard,cause,effect,mitigation,now+2592000000));
 statements.push(
 db.prepare("INSERT OR IGNORE INTO clinics(id,created_at,organization_id,name) VALUES('demo-clinic',?,?,'Synthetic Regina clinic')").bind(now,DEMO_ORG),
 db.prepare("INSERT OR IGNORE INTO memberships(id,created_at,organization_id,user_id,role,clinic_id,status) VALUES('synthetic-patient-membership',?,?,?,'Patient','demo-clinic','active')").bind(now,DEMO_ORG,DEMO_USER),
 db.prepare("INSERT OR IGNORE INTO patients(id,created_at,organization_id,clinic_id,owner_user_id,synthetic_label) VALUES('demo-patient',?,?,'demo-clinic',?,'SYNTHETIC: Alex Morgan')").bind(now,DEMO_ORG,DEMO_USER),
 db.prepare("INSERT OR IGNORE INTO users(id,created_at,subject,status) VALUES('demo-provider-user',?,'NONLOGIN-SYNTHETIC-PROVIDER','pending')").bind(now),
 db.prepare("INSERT OR IGNORE INTO memberships(id,created_at,organization_id,user_id,role,clinic_id,status) VALUES('demo-provider-membership',?,?,'demo-provider-user','Healthcare Professional','demo-clinic','active')").bind(now,DEMO_ORG),
 db.prepare("INSERT OR IGNORE INTO providers(id,created_at,organization_id,user_id,profession) VALUES('demo-provider',?,?,'demo-provider-user','SYNTHETIC: NP')").bind(now,DEMO_ORG),
 db.prepare("INSERT OR IGNORE INTO provider_credentials(id,created_at,organization_id,provider_id,regulator,jurisdiction,verification_source,evidence_id,verified_at,expires_at,status) VALUES('demo-credential',?,?,'demo-provider','SYNTHETIC','SK','SYNTHETIC fixture','SYNTHETIC evidence',?,?,'Verified')").bind(now,DEMO_ORG,now,now+31536000000)
 );
 for(const [id,time] of [['demo-slot-1','10:30:00'],['demo-slot-2','11:00:00'],['demo-slot-3','13:30:00']]){const start=Date.parse('2026-10-02T'+time+'-06:00');statements.push(db.prepare("INSERT OR IGNORE INTO availability(id,organization_id,clinic_id,provider_id,starts_at,ends_at,timezone) VALUES(?,?,'demo-clinic','demo-provider',?,?,'America/Regina')").bind(id,DEMO_ORG,start,start+1200000));}

 // Baseline historical audit events
 const baselineAudits = [
  ['audit-01', now - 86400000 * 3, 'SYSTEM', 'System Administrator', null, 'system.bootstrap', 'SYSTEM_INITIALIZE', 'Platform environment initialization and security baseline', 'allowed', 'success', 'corr-boot-001', 'system-init-session'],
  ['audit-02', now - 86400000 * 2, DEMO_USER, 'Security Officer', null, 'mfa.policy', 'SECURITY_POLICY_CHECK', 'Multi-factor verification requirement enforcement', 'allowed', 'success', 'corr-sec-002', 'sec-audit-session'],
  ['audit-03', now - 86400000 * 2 + 3600000, 'unauthenticated-probe', 'Anonymous', null, 'admin.console', 'AUTHORIZE', 'External access without verified credential token', 'denied', 'denied', 'corr-probe-003', 'unknown'],
  ['audit-04', now - 86400000, DEMO_USER, 'Privacy Officer', 'demo-patient', 'consent.record', 'CONSENT_EVALUATE', 'Saskatchewan HIPA purpose limitation assessment', 'allowed', 'success', 'corr-consent-004', 'priv-session-004'],
  ['audit-05', now - 43200000, DEMO_USER, 'Healthcare Professional', 'demo-patient', 'synthetic-patient', 'READ', 'Care coordination and continuity review for synthetic patient', 'allowed', 'success', 'corr-care-005', 'clin-session-005'],
  ['audit-06', now - 21600000, DEMO_USER, 'System Administrator', null, 'mfa_factors', 'MFA_ENROLL', 'Hardware authenticator key registration', 'allowed', 'success', 'corr-mfa-006', 'auth-session-006'],
  ['audit-07', now - 7200000, 'SYSTEM', 'System Administrator', null, 'd1.schema', 'INTEGRITY_CHECK', 'Database schema immutability and foreign key validation', 'allowed', 'success', 'corr-db-007', 'sys-cron-007'],
  ['audit-08', now - 1800000, DEMO_USER, 'System Administrator', null, 'governance.readiness', 'READ', 'Verification of release gates and compliance evidence', 'allowed', 'success', 'corr-gov-008', 'gov-session-008']
 ];

 for (const [id, createdAt, actor, role, patientId, resource, action, purpose, authResult, result, corrId, sess] of baselineAudits) {
  statements.push(db.prepare("INSERT OR IGNORE INTO audit_events(id,created_at,organization_id,actor,role,patient_id,resource,action,purpose,authorization_result,result,correlation_id,session_context) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id, createdAt, DEMO_ORG, actor, role, patientId, resource, action, purpose, authResult, result, corrId, sess));
 }

 // Baseline security events
 const baselineSecurity = [
  ['sec-01', now - 86400000 * 2, 'IAM_MFA_POLICY', 'LOW', 'corr-sec-002', 'RESOLVED'],
  ['sec-02', now - 86400000 * 2 + 3600000, 'UNAUTHORIZED_ACCESS_ATTEMPT', 'MEDIUM', 'corr-probe-003', 'BLOCKED'],
  ['sec-03', now - 43200000, 'TLS_CIPHER_SUITE_AUDIT', 'INFORMATIONAL', 'corr-tls-009', 'VERIFIED'],
  ['sec-04', now - 7200000, 'DATABASE_INTEGRITY_VERIFICATION', 'LOW', 'corr-db-007', 'PASSED']
 ];

 for (const [id, createdAt, category, severity, corrId, status] of baselineSecurity) {
  statements.push(db.prepare("INSERT OR IGNORE INTO security_events(id,created_at,organization_id,category,severity,correlation_id,status) VALUES(?,?,?,?,?,?,?)").bind(id, createdAt, DEMO_ORG, category, severity, corrId, status));
 }

 await db.batch(statements);return {token:await new Foundation(db).login(DEMO_USER,workspace==='patient'?'synthetic-patient-membership':'synthetic-demo-membership'),factorId:'synthetic-demo-totp',secret:DEMO_SECRET};
}
