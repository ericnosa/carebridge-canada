import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {service} from './load-service.mjs';
const {Foundation,hashToken,permissionMap}=await service('foundation');
export const now=2000000;
export async function setup(){
 const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync('drizzle/'+f,'utf8'));
 function stmt(query,values=[]){return {bind(...v){return stmt(query,v)},async first(){return sql.prepare(query).get(...values)??null},async all(){return {results:sql.prepare(query).all(...values)}},async run(){return {meta:{changes:sql.prepare(query).run(...values).changes}}},query,values};}
 const db={prepare:q=>stmt(q),async batch(statements){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push({meta:{changes:sql.prepare(s.query).run(...s.values).changes}});sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}};
 function insert(table,record){const keys=Object.keys(record);sql.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')})`).run(...Object.values(record));}
 for(const org of ['org','other'])insert('organizations',{id:org,created_at:0,name:'SYNTHETIC',status:'active'});
 for(const [clinic,org] of [['A','org'],['B','org'],['C','other']])insert('clinics',{id:clinic,created_at:0,organization_id:org,name:'SYNTHETIC'});
 for(const [role,permissions] of Object.entries(permissionMap))for(const permission of permissions)insert('role_permissions',{id:role+permission,role,permission});
 async function user(id,role,clinic='A',org='org'){
 insert('users',{id,created_at:0,subject:id,status:'active'});insert('memberships',{id:'m'+id,created_at:0,organization_id:org,user_id:id,role,clinic_id:clinic,status:'active'});
 insert('sessions',{id:'s'+id,created_at:0,organization_id:org,user_id:id,membership_id:'m'+id,token_hash:await hashToken(id),mfa_verified_at:now-1000,expires_at:now+10000});return {subject:id,token:id};}
 const doctor=await user('doc','Healthcare Professional');const admin=await user('admin','Clinic Administrator');const privacy=await user('privacy','Privacy Officer',null);const staff=await user('staff','Clinic Staff');const staffB=await user('staffB','Clinic Staff','B');
 insert('providers',{id:'provider',created_at:0,organization_id:'org',user_id:'doc',profession:'SYNTHETIC'});
 insert('provider_credentials',{id:'credential',created_at:0,organization_id:'org',provider_id:'provider',regulator:'SYNTHETIC',jurisdiction:'SK',verification_source:'SYNTHETIC',evidence_id:'SYNTHETIC',verified_at:0,expires_at:now+10000,status:'Verified'});
 for(const [id,clinic,org] of [['pA','A','org'],['pB','B','org'],['pC','C','other']])insert('patients',{id,created_at:0,organization_id:org,clinic_id:clinic,synthetic_label:'SYNTHETIC: fixture'});
 insert('processing_authorities',{id:'authority',created_at:0,organization_id:'org',patient_id:'pA',basis:'SYNTHETIC',purpose:'care',scope:'synthetic-demographics',recipient:'doc',reviewer:'SYNTHETIC',evidence:'SYNTHETIC',effective_at:0,expires_at:now+10000,status:'Approved',consent_required:1});
 insert('care_relationships',{id:'rel',created_at:0,organization_id:'org',patient_id:'pA',provider_id:'provider',clinic_id:'A',authority_id:'authority',relationship_type:'SYNTHETIC',starts_at:0,ends_at:now+10000,status:'active'});
 insert('consent_records',{id:'consent',created_at:0,organization_id:'org',patient_id:'pA',recipient:'doc',scope:'synthetic-demographics',purpose:'care',effective_at:0,expires_at:now+10000,policy_version:'demo',version:1,evidence:'SYNTHETIC',status:'Granted'});
 return {sql,db,insert,user,doctor,admin,privacy,staff,staffB,service:new Foundation(db,()=>now)};
}
