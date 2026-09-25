import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../lib/authorization.ts',import.meta.url),'utf8');
const js=ts.transpile(source,{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022});
const {authorize,authorizePatient,clinicalPublishAllowed,connectorAvailable}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const now=Date.now();
const p={userId:'synthetic-user',organizationId:'A',clinicId:'clinic-A',role:'Healthcare Professional',active:true,sessionExpiresAt:now+10000,revokedAt:null,mfaVerifiedAt:now-1000};
const resource={organizationId:'A',clinicId:'clinic-A'};
const context={relationshipActive:true,relationshipExpiresAt:now+10000,credentialStatus:'Verified',credentialExpiresAt:now+10000,authorityStatus:'Approved',authorityExpiresAt:now+10000,consentRequired:true,consentStatus:'Granted',consentExpiresAt:now+10000};
test('explicit valid authorization succeeds',()=>assert.equal(authorizePatient(p,resource,context,now),true));
for(const [label,who,res] of [
 ['anonymous',null,resource],['cross tenant',p,{...resource,organizationId:'B'}],['cross clinic',p,{...resource,clinicId:'clinic-B'}],['revoked session',{...p,revokedAt:now-1},resource],['expired session',{...p,sessionExpiresAt:now-1},resource],['missing MFA',{...p,mfaVerifiedAt:null},resource],['stale MFA',{...p,mfaVerifiedAt:now-1000000},resource],['inactive membership',{...p,active:false},resource],['role escalation',{...p,role:'System Administrator'},resource]
])test(label,()=>assert.equal(authorize(who,res,['Healthcare Professional'],now),false));
for(const [label,delta] of [['withdrawn consent',{consentStatus:'Withdrawn'}],['expired consent',{consentExpiresAt:now-1}],['expired credential',{credentialExpiresAt:now-1}],['suspended provider',{credentialStatus:'Suspended'}],['missing relationship',{relationshipActive:false}],['expired authority',{authorityExpiresAt:now-1}]])test(label,()=>assert.equal(authorizePatient(p,resource,{...context,...delta},now),false));
test('separate approved authority can operate without consent when policy says consent is not required',()=>assert.equal(authorizePatient(p,resource,{...context,consentRequired:false,consentStatus:'Declined'},now),true));
test('unapproved clinical content cannot publish',()=>assert.equal(clinicalPublishAllowed({status:'Approved'},now),false));
test('missing connector validation fails closed',()=>assert.equal(connectorAvailable({status:'Production',agreementStatus:'Approved',privacyReview:'Approved',securityReview:'Approved',lastValidation:null},now),false));
test('PHI gate fixed false and catch-all rejects all mutations',()=>{assert.match(readFileSync(new URL('../lib/governance.ts',import.meta.url),'utf8'),/PHI_PRODUCTION_ENABLED = false as const/);const api=readFileSync(new URL('../app/api/[...path]/route.ts',import.meta.url),'utf8');for(const method of ['GET','POST','PUT','PATCH','DELETE'])assert.match(api,new RegExp(method+'=blockedResponse'));});
test('governance API delegates to the shared authenticated service',()=>{const api=readFileSync(new URL('../app/api/governance/[section]/route.ts',import.meta.url),'utf8');assert.match(api,/foundation\(\).summary\(await identity\(\),key\)/);assert.match(api,/POST=blockedResponse/);});
