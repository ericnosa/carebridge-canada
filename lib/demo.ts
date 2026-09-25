import {Foundation,type Identity} from './foundation';
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
 await db.batch(statements);return {token:await new Foundation(db).login(DEMO_USER,workspace==='patient'?'synthetic-patient-membership':'synthetic-demo-membership'),factorId:'synthetic-demo-totp',secret:DEMO_SECRET};
}
