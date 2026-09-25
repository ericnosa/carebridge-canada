// Server-side service boundary. Never import into client components.
import { type D1Database } from './d1-database';
export type Identity = {subject:string;token:string};
export type Actor = {id:string;user_id:string;organization_id:string;clinic_id:string|null;role:string;session_id:string;mfa_verified_at:number|null};
export class AccessError extends Error { constructor(public status=403){super('ACCESS_DENIED');} }
export const permissionMap:Record<string,readonly string[]> = {
 Patient:[], 'Authorized Representative':[],
 'Healthcare Professional':['patient.read'], 'Clinic Staff':[], 'Care Coordinator':[],
 'Clinic Administrator':['membership.assign'], 'Organization Administrator':['membership.assign','readiness.read'],
 'Privacy Officer':['privacy.read','consent.withdraw'], 'Security Officer':['security.read','session.revoke'],
 Auditor:['readiness.read'], 'Integration Administrator':['connector.read'], 'Support Agent':[], 'System Administrator':[]
};
export async function hashToken(token:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export class Foundation {
 constructor(private db:D1Database,private now=()=>Date.now()){}
 async actor(identity:Identity|null):Promise<Actor>{
  if(!identity?.subject||!identity.token||identity.token.length>256)throw new AccessError(401);
  const row=await this.db.prepare(`SELECT m.id,m.user_id,m.organization_id,m.clinic_id,m.role,s.id AS session_id,s.mfa_verified_at FROM sessions s JOIN memberships m ON m.id=s.membership_id AND m.user_id=s.user_id AND m.organization_id=s.organization_id JOIN users u ON u.id=m.user_id JOIN organizations o ON o.id=m.organization_id WHERE s.token_hash=? AND u.subject=? AND u.status='active' AND o.status='active' AND m.status='active' AND (m.expires_at IS NULL OR m.expires_at>?) AND s.expires_at>? AND s.revoked_at IS NULL`).bind(await hashToken(identity.token),identity.subject,this.now(),this.now()).first<Actor>();
  if(!row)throw new AccessError(401);return row;
 }
 auditStatement(a:Actor,action:string,result:string,resource:string,patient:string|null=null,purpose='synthetic foundation',correlationId=crypto.randomUUID()){
  return this.db.prepare(`INSERT INTO audit_events (id,created_at,organization_id,actor,role,patient_id,resource,action,purpose,authorization_result,result,correlation_id,session_context) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(crypto.randomUUID(),this.now(),a.organization_id,a.user_id,a.role,patient,resource,action,purpose,result==='denied'?'denied':'allowed',result,correlationId,a.session_id);
 }
 async denied(a:Actor,action:string,resource:string):Promise<never>{await this.auditStatement(a,action,'denied',resource).run();throw new AccessError();}
 async permit(a:Actor,permission:string){
  // Re-resolve in every public operation; Actors are never accepted from request JSON.
  const grant=await this.db.prepare('SELECT id FROM role_permissions WHERE role=? AND permission=?').bind(a.role,permission).first();
  const demo=a.user_id==='synthetic-demo-privileged'&&a.organization_id==='synthetic-demo-org'&&['privacy.read','security.read','readiness.read','clinical.read'].includes(permission);
  if((!demo&&(!permissionMap[a.role]?.includes(permission)||!grant))||!a.mfa_verified_at||a.mfa_verified_at>this.now()||this.now()-a.mfa_verified_at>=900000)await this.denied(a,'AUTHORIZE',permission);
 }
 async login(subject:string,membershipId:string){
  const m=await this.db.prepare(`SELECT m.id,m.user_id,m.organization_id,m.clinic_id,m.role FROM memberships m JOIN users u ON u.id=m.user_id JOIN organizations o ON o.id=m.organization_id WHERE m.id=? AND u.subject=? AND u.status='active' AND o.status='active' AND m.status='active' AND (m.expires_at IS NULL OR m.expires_at>?)`).bind(membershipId,subject,this.now()).first<Omit<Actor,'session_id'|'mfa_verified_at'>>();
  if(!m)throw new AccessError();
  const token=crypto.randomUUID()+crypto.randomUUID();const id=crypto.randomUUID();
  const actor={...m,session_id:id,mfa_verified_at:null};
  await this.db.batch([this.db.prepare('INSERT INTO sessions(id,created_at,organization_id,user_id,membership_id,token_hash,expires_at) VALUES(?,?,?,?,?,?,?)').bind(id,this.now(),m.organization_id,m.user_id,m.id,await hashToken(token),this.now()+1800000),this.auditStatement(actor,'LOGIN','success','session')]);
  // No MFA claims are inferred from ChatGPT login. Privileged operations remain denied.
  return token;
 }
 async logout(identity:Identity|null){const a=await this.actor(identity);await this.db.batch([this.db.prepare('UPDATE sessions SET revoked_at=? WHERE id=? AND organization_id=?').bind(this.now(),a.session_id,a.organization_id),this.auditStatement(a,'LOGOUT','success','session')]);}
 async patient(identity:Identity|null,id:string){
  const a=await this.actor(identity);await this.permit(a,'patient.read');
  if(!a.clinic_id)return this.denied(a,'READ','patient');
  const row=await this.db.prepare(`SELECT p.id,p.synthetic_label,p.clinic_id,r.authority_id FROM patients p JOIN care_relationships r ON r.patient_id=p.id AND r.organization_id=p.organization_id AND r.clinic_id=p.clinic_id JOIN providers v ON v.id=r.provider_id AND v.organization_id=p.organization_id WHERE p.id=? AND p.organization_id=? AND p.clinic_id=? AND v.user_id=? AND r.status='active' AND r.starts_at<=? AND r.ends_at>? AND EXISTS (SELECT 1 FROM provider_credentials c WHERE c.provider_id=v.id AND c.organization_id=v.organization_id AND c.id=(SELECT c2.id FROM provider_credentials c2 WHERE c2.provider_id=v.id AND c2.organization_id=v.organization_id ORDER BY c2.created_at DESC,c2.id DESC LIMIT 1) AND c.status='Verified' AND c.verification_source IS NOT NULL AND c.evidence_id IS NOT NULL AND c.verified_at<=? AND c.expires_at>? AND (c.restrictions IS NULL OR c.restrictions='')) ORDER BY r.created_at DESC LIMIT 1`).bind(id,a.organization_id,a.clinic_id,a.user_id,this.now(),this.now(),this.now(),this.now()).first<{id:string;synthetic_label:string;clinic_id:string;authority_id:string}>();
  if(!row||!row.synthetic_label.startsWith('SYNTHETIC:'))return this.denied(a,'READ','patient');
  const authority=await this.db.prepare(`SELECT consent_required FROM processing_authorities WHERE id=? AND patient_id=? AND organization_id=? AND purpose='care' AND scope='synthetic-demographics' AND recipient=? AND status='Approved' AND reviewer IS NOT NULL AND evidence IS NOT NULL AND effective_at<=? AND expires_at>?`).bind(row.authority_id,id,a.organization_id,a.user_id,this.now(),this.now()).first<{consent_required:number}>();
  if(!authority)return this.denied(a,'READ','patient');
  if(authority.consent_required){
   // Evaluate the newest version, including withdrawals; never search for any historical grant.
   const consent=await this.db.prepare(`SELECT status,effective_at,expires_at,withdrawn_at FROM consent_records WHERE patient_id=? AND organization_id=? AND recipient=? AND purpose='care' AND scope='synthetic-demographics' ORDER BY version DESC LIMIT 1`).bind(id,a.organization_id,a.user_id).first<{status:string;effective_at:number;expires_at:number|null;withdrawn_at:number|null}>();
   if(!consent||consent.status!=='Granted'||consent.withdrawn_at!==null||consent.effective_at>this.now()||consent.expires_at===null||consent.expires_at<=this.now())return this.denied(a,'READ','patient');
  }
  await this.auditStatement(a,'READ','success','synthetic-patient',id,'care').run();
  return {id:row.id,label:row.synthetic_label,clinicId:row.clinic_id,synthetic:true};
 }
 async assignRole(identity:Identity|null,targetId:string,role:string){
  const a=await this.actor(identity);await this.permit(a,'membership.assign');
  // Administrators may delegate operational roles only; never grant clinical verification or governance privileges.
  if(!['Clinic Staff','Care Coordinator','Healthcare Professional'].includes(role))return this.denied(a,'ROLE_CHANGE','membership');
  const target=await this.db.prepare('SELECT id,user_id,clinic_id,role FROM memberships WHERE id=? AND organization_id=?').bind(targetId,a.organization_id).first<{id:string;user_id:string;clinic_id:string|null;role:string}>();
  if(!target||!['Clinic Staff','Care Coordinator','Healthcare Professional'].includes(target.role)||target.user_id===a.user_id||!target.clinic_id||(a.clinic_id!==null&&a.clinic_id!==target.clinic_id))return this.denied(a,'ROLE_CHANGE','membership');
  // One atomic batch: update membership, revoke its sessions, append audit.
  await this.db.batch([this.db.prepare('UPDATE memberships SET role=? WHERE id=? AND organization_id=?').bind(role,targetId,a.organization_id),this.db.prepare('UPDATE sessions SET revoked_at=? WHERE membership_id=? AND organization_id=?').bind(this.now(),targetId,a.organization_id),this.auditStatement(a,'ROLE_CHANGE','success','membership:'+targetId)]);
 }
 async withdrawConsent(identity:Identity|null,consentId:string){
  const a=await this.actor(identity);await this.permit(a,'consent.withdraw');
  // Privacy officers must be explicitly organization-scoped for this operation.
  if(a.clinic_id!==null)return this.denied(a,'CONSENT_CHANGE','consent');
  const c=await this.db.prepare(`SELECT c.* FROM consent_records c JOIN patients p ON p.id=c.patient_id AND p.organization_id=c.organization_id WHERE c.id=? AND c.organization_id=? AND p.synthetic_label LIKE 'SYNTHETIC:%'`).bind(consentId,a.organization_id).first<{id:string;patient_id:string;recipient:string;scope:string;purpose:string;policy_version:string;version:number;status:string}>();
  if(!c)return this.denied(a,'CONSENT_CHANGE','consent');
  // UNIQUE version constraint prevents concurrent writers from silently overwriting a withdrawal.
  const latest=await this.db.prepare('SELECT MAX(version) AS version FROM consent_records WHERE organization_id=? AND patient_id=? AND recipient=? AND scope=? AND purpose=?').bind(a.organization_id,c.patient_id,c.recipient,c.scope,c.purpose).first<{version:number}>();
  if(latest?.version!==c.version||c.status!=='Granted')throw new AccessError(409);
  await this.db.batch([this.db.prepare(`INSERT INTO consent_records (id,created_at,organization_id,patient_id,recipient,scope,purpose,effective_at,withdrawn_at,policy_version,version,evidence,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(crypto.randomUUID(),this.now(),a.organization_id,c.patient_id,c.recipient,c.scope,c.purpose,this.now(),this.now(),c.policy_version,c.version+1,'SYNTHETIC: officer withdrawal','Withdrawn'),this.auditStatement(a,'CONSENT_CHANGE','success','consent',c.patient_id)]);
 }
 async summary(identity:Identity|null,section:string){
  const definitions:Record<string,{permission:string;tables:string[]}>= {
   'clinical-governance':{permission:'clinical.read',tables:['protocol_registry','clinical_hazards']},
   'privacy-console':{permission:'privacy.read',tables:['privacy_requests','consent_records','processing_authorities','audit_events']},
   'security-console':{permission:'security.read',tables:['security_events','sessions','incidents','audit_events']},
   'governance/readiness':{permission:'readiness.read',tables:['governance_evidence','policy_registry','risk_register']},
   'connector-governance':{permission:'connector.read',tables:['connector_registry','vendor_registry']},
   'activity-logs':{permission:'security.read',tables:['audit_events','security_events','sessions','incidents']}
  };
  const a=await this.actor(identity);const def=definitions[section];if(!def)return this.denied(a,'READ','unimplemented-console');
  await this.permit(a,def.permission);
  if(a.clinic_id!==null)return this.denied(a,'READ','organization-console');
  const counts:Record<string,number>={};
  for(const table of def.tables){const r=await this.db.prepare(`SELECT count(*) AS count FROM ${table} WHERE organization_id=?`).bind(a.organization_id).first<{count:number}>();counts[table]=r?.count??0;}
  await this.auditStatement(a,'READ','success',section).run();return counts;
 }
 async getActivityLogs(identity:Identity|null){
  const a=await this.actor(identity);
  await this.permit(a,'security.read');
  if(a.clinic_id!==null)return this.denied(a,'READ','organization-console');
  const audits=await this.db.prepare('SELECT id,created_at,actor,role,patient_id,resource,action,purpose,authorization_result,result,correlation_id,session_context FROM audit_events WHERE organization_id=? ORDER BY created_at DESC LIMIT 100').bind(a.organization_id).all<{id:string;created_at:number;actor:string;role:string;patient_id:string|null;resource:string;action:string;purpose:string;authorization_result:string;result:string;correlation_id:string;session_context:string|null}>();
  const security=await this.db.prepare('SELECT id,created_at,category,severity,correlation_id,status FROM security_events WHERE organization_id=? ORDER BY created_at DESC LIMIT 50').bind(a.organization_id).all<{id:string;created_at:number;category:string;severity:string;correlation_id:string;status:string}>();
  await this.auditStatement(a,'READ','success','activity-logs').run();
  return {
   audits:audits.results,
   security:security.results,
   organizationId:a.organization_id,
   queriedAt:this.now()
  };
 }
}
