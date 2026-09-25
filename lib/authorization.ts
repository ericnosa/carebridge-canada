export const roles = ['Patient','Authorized Representative','Healthcare Professional','Clinic Staff','Care Coordinator','Clinic Administrator','Organization Administrator','Privacy Officer','Security Officer','Auditor','Integration Administrator','Support Agent','System Administrator'] as const;
export type Role = typeof roles[number];
export type Principal = {userId:string; organizationId:string; clinicId:string|null; role:Role; active:boolean; sessionExpiresAt:number; revokedAt:number|null; mfaVerifiedAt:number|null};
export const consoleRoles:Record<string,readonly Role[]> = {
 'privacy-console':['Privacy Officer'], 'security-console':['Security Officer'],
 'clinical-governance':['Healthcare Professional'], 'governance/readiness':['Auditor','Privacy Officer','Security Officer','Organization Administrator'],
 'connector-governance':['Integration Administrator'], 'ai-governance':['Privacy Officer','Security Officer']
};
export function authorize(p:Principal|null, resource:{organizationId:string;clinicId?:string|null}, allowed:readonly Role[], now=Date.now()):boolean {
 return !!p && p.active && !p.revokedAt && p.sessionExpiresAt>now && p.organizationId===resource.organizationId && (!resource.clinicId || p.clinicId===resource.clinicId) && allowed.includes(p.role) && !!p.mfaVerifiedAt && p.mfaVerifiedAt<=now && now-p.mfaVerifiedAt<15*60*1000;
}
export type PatientContext = {relationshipActive:boolean;relationshipExpiresAt:number; credentialStatus:string;credentialExpiresAt:number; authorityStatus:string; authorityExpiresAt:number; consentRequired:boolean; consentStatus:string;consentExpiresAt:number};
export function authorizePatient(p:Principal|null,r:{organizationId:string;clinicId:string},c:PatientContext,now=Date.now()) {
 return authorize(p,r,['Healthcare Professional'],now) && c.relationshipActive && c.relationshipExpiresAt>now && c.credentialStatus==='Verified' && c.credentialExpiresAt>now && c.authorityStatus==='Approved' && c.authorityExpiresAt>now && (!c.consentRequired || (c.consentStatus==='Granted'&&c.consentExpiresAt>now));
}
export function clinicalPublishAllowed(v:{status:string;reviewer?:string|null;approvedAt?:number|null;nextReviewAt?:number|null;sourceUrl?:string|null},now=Date.now()) {return v.status==='Approved'&&!!v.reviewer&&!!v.approvedAt&&v.approvedAt<=now&&!!v.nextReviewAt&&v.nextReviewAt>now&&!!v.sourceUrl?.startsWith('https://');}
export function connectorAvailable(v:{status:string;agreementStatus:string;privacyReview:string;securityReview:string;lastValidation:number|null},now=Date.now()) {return v.status==='Production'&&v.agreementStatus==='Approved'&&v.privacyReview==='Approved'&&v.securityReview==='Approved'&&!!v.lastValidation&&v.lastValidation<=now&&now-v.lastValidation<86400000;}
