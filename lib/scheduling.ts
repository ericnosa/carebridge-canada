import {Foundation,AccessError,type Identity,type Actor} from './foundation';
import {type D1Database, type D1PreparedStatement} from './d1-database';
export class Scheduling {
 private auth:Foundation;
 constructor(private db:D1Database,private now=()=>Date.now()){this.auth=new Foundation(db,now);}
 private async actor(identity:Identity|null){const a=await this.auth.actor(identity);if(!a.clinic_id||a.role!=='Patient')return this.auth.denied(a,'AUTHORIZE','demo-scheduling');return a;}
 private eligible=`EXISTS (SELECT 1 FROM providers v JOIN memberships m ON m.user_id=v.user_id AND m.organization_id=v.organization_id AND m.clinic_id=s.clinic_id JOIN provider_credentials c ON c.provider_id=v.id AND c.organization_id=v.organization_id WHERE v.id=s.provider_id AND v.organization_id=s.organization_id AND m.role='Healthcare Professional' AND m.status='active' AND (m.expires_at IS NULL OR m.expires_at>?) AND c.id=(SELECT c2.id FROM provider_credentials c2 WHERE c2.provider_id=v.id AND c2.organization_id=v.organization_id ORDER BY c2.created_at DESC,c2.id DESC LIMIT 1) AND c.status='Verified' AND c.verified_at<=? AND c.expires_at>? AND c.evidence_id IS NOT NULL AND c.verification_source IS NOT NULL AND (c.restrictions IS NULL OR c.restrictions=''))`;
 private async slot(a:Actor,id:string){const s=await this.db.prepare(`SELECT s.* FROM availability s WHERE s.id=? AND s.organization_id=? AND s.clinic_id=? AND s.starts_at>? AND ${this.eligible}`).bind(id,a.organization_id,a.clinic_id,this.now(),this.now(),this.now(),this.now()).first<{id:string;organization_id:string;clinic_id:string;provider_id:string;starts_at:number;ends_at:number;version:number}>();if(!s)throw new AccessError(404);return s;}
 async slots(identity:Identity|null){const a=await this.actor(identity);const result=await this.db.prepare(`SELECT s.id,s.starts_at,s.ends_at,s.timezone,s.version FROM availability s WHERE s.organization_id=? AND s.clinic_id=? AND s.starts_at>? AND ${this.eligible} AND NOT EXISTS(SELECT 1 FROM appointments b WHERE b.slot_id=s.id AND b.status='booked') ORDER BY s.starts_at LIMIT 50`).bind(a.organization_id,a.clinic_id,this.now(),this.now(),this.now(),this.now()).all();await this.auth.auditStatement(a,'VIEW','success','demo-slots').run();return result.results;}
 async book(identity:Identity|null,patientId:string,slotId:string,key:string,version:number){
  const a=await this.actor(identity);
  const prior=await this.db.prepare('SELECT id,patient_id,original_slot FROM appointments WHERE organization_id=? AND actor=? AND idempotency_key=?').bind(a.organization_id,a.user_id,key).first<{id:string;patient_id:string;original_slot:string}>();
  if(prior){if(prior.patient_id!==patientId||prior.original_slot!==slotId)throw new AccessError(409);return this.view(identity,prior.id);}
  const p=await this.db.prepare("SELECT id FROM patients WHERE id=? AND organization_id=? AND clinic_id=? AND owner_user_id=? AND synthetic_label LIKE 'SYNTHETIC:%'").bind(patientId,a.organization_id,a.clinic_id,a.user_id).first();if(!p)return this.auth.denied(a,'CREATE','demo-appointment');
  const s=await this.slot(a,slotId);if(s.version!==version)throw new AccessError(409);
  const id=crypto.randomUUID(),rel=crypto.randomUUID();
  // D1 batch is atomic. DB uniqueness enforces reservation + idempotency, including competing Workers.
  try {await this.db.batch([
   this.db.prepare(`INSERT INTO care_relationships(id,created_at,organization_id,patient_id,provider_id,clinic_id,relationship_type,starts_at,ends_at,status) VALUES(?,?,?,?,?,?,'synthetic-scheduling',?,?,'active')`).bind(rel,this.now(),a.organization_id,patientId,s.provider_id,a.clinic_id,this.now(),s.ends_at+86400000),
   this.db.prepare(`INSERT INTO appointments(id,organization_id,clinic_id,patient_id,slot_id,actor,idempotency_key,original_slot,relationship_id,status,version,label,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,'booked',1,'Demo',?,?)`).bind(id,a.organization_id,a.clinic_id,patientId,slotId,a.user_id,key,slotId,rel,this.now(),this.now()),
   this.db.prepare('UPDATE availability SET version=version+1 WHERE id=? AND version=?').bind(slotId,version),
   this.db.prepare('INSERT INTO transaction_assertions(value) VALUES(changes())'),this.db.prepare('DELETE FROM transaction_assertions')
  ]);}catch{
   const existing=await this.db.prepare('SELECT id,patient_id,original_slot FROM appointments WHERE organization_id=? AND actor=? AND idempotency_key=?').bind(a.organization_id,a.user_id,key).first<{id:string;patient_id:string;original_slot:string}>();
   if(existing&&existing.patient_id===patientId&&existing.original_slot===slotId)return this.view(identity,existing.id);
   throw new AccessError(409);
  }
  return this.view(identity,id);
 }
 async view(identity:Identity|null,id:string){const a=await this.actor(identity);const row=await this.db.prepare(`SELECT b.id,b.patient_id,b.status,b.version,b.label,s.starts_at,s.ends_at,s.timezone FROM appointments b JOIN patients p ON p.id=b.patient_id AND p.organization_id=b.organization_id AND p.clinic_id=b.clinic_id JOIN availability s ON s.id=b.slot_id AND s.organization_id=b.organization_id AND s.clinic_id=b.clinic_id JOIN care_relationships r ON r.id=b.relationship_id AND r.patient_id=p.id AND r.organization_id=p.organization_id AND r.clinic_id=p.clinic_id AND r.provider_id=s.provider_id WHERE b.id=? AND b.organization_id=? AND b.clinic_id=? AND p.owner_user_id=? AND r.status='active' AND r.starts_at<=? AND r.ends_at>?`).bind(id,a.organization_id,a.clinic_id,a.user_id,this.now(),this.now()).first<{id:string;patient_id:string;status:string;version:number;label:string;starts_at:number;ends_at:number;timezone:string}>();if(!row)return this.auth.denied(a,'VIEW','demo-appointment');await this.auth.auditStatement(a,'VIEW','success','demo-appointment:'+id,String(row.patient_id)).run();return row;}
 async mine(identity:Identity|null){const a=await this.actor(identity);const rows=await this.db.prepare(`SELECT b.id FROM appointments b JOIN patients p ON p.id=b.patient_id AND p.organization_id=b.organization_id AND p.clinic_id=b.clinic_id JOIN care_relationships r ON r.id=b.relationship_id AND r.patient_id=p.id AND r.organization_id=p.organization_id AND r.clinic_id=p.clinic_id WHERE b.organization_id=? AND b.clinic_id=? AND p.owner_user_id=? AND r.status='active' AND r.starts_at<=? AND r.ends_at>? ORDER BY b.created_at DESC LIMIT 20`).bind(a.organization_id,a.clinic_id,a.user_id,this.now(),this.now()).all<{id:string}>();const out=[];for(const r of rows.results)out.push(await this.view(identity,r.id));return out;}
 async change(identity:Identity|null,id:string,version:number,slotId?:string){
  const a=await this.actor(identity);const current=await this.view(identity,id);if(current.status!=='booked'||current.version!==version)throw new AccessError(409);
  const slot=slotId?await this.slot(a,slotId):null;const rel=crypto.randomUUID();
  const operations:D1PreparedStatement[]=[];
  if(slot)operations.push(this.db.prepare(`INSERT INTO care_relationships(id,created_at,organization_id,patient_id,provider_id,clinic_id,relationship_type,starts_at,ends_at,status) VALUES(?,?,?,?,?,?,'synthetic-scheduling',?,?,'active')`).bind(rel,this.now(),a.organization_id,current.patient_id,slot.provider_id,a.clinic_id,this.now(),slot.ends_at+86400000));
  operations.push(slot?this.db.prepare(`UPDATE appointments SET slot_id=?,relationship_id=?,version=version+1,updated_at=? WHERE id=? AND organization_id=? AND clinic_id=? AND version=? AND status='booked'`).bind(slot.id,rel,this.now(),id,a.organization_id,a.clinic_id,version):this.db.prepare(`UPDATE appointments SET status='cancelled',version=version+1,updated_at=? WHERE id=? AND organization_id=? AND clinic_id=? AND version=? AND status='booked'`).bind(this.now(),id,a.organization_id,a.clinic_id,version));
  operations.push(this.db.prepare('INSERT INTO transaction_assertions(value) VALUES(changes())'),this.db.prepare('DELETE FROM transaction_assertions'));
  if(slot)operations.push(this.db.prepare('UPDATE availability SET version=version+1 WHERE id=? AND version=?').bind(slot.id,slot.version),this.db.prepare('INSERT INTO transaction_assertions(value) VALUES(changes())'),this.db.prepare('DELETE FROM transaction_assertions'));
  try{await this.db.batch(operations);}catch{throw new AccessError(409);}return this.view(identity,id);
 }
}
