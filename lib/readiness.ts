export const readinessStatuses=['Proposed','Implemented','Tested','Human Review Required','Approved','Blocked'] as const;
export const readinessRegister=[
 {area:'Tenancy and permissions',status:'Tested',evidence:'tests/foundation.test.mjs'},
 {area:'MFA and recovery',status:'Implemented',evidence:'lib/mfa.ts; deployment/device verification required'},
 {area:'Synthetic scheduling',status:'Implemented',evidence:'lib/scheduling.ts; tests/scheduling.test.mjs'},
 {area:'Clinical protocols and hazards',status:'Human Review Required',evidence:'Synthetic fixtures only; no clinical approval'},
 {area:'Privacy and legal approvals',status:'Human Review Required',evidence:'External evidence not supplied'},
 {area:'Real staff provisioning',status:'Blocked',evidence:'Authorized identities and approval required'},
 {area:'Production PHI',status:'Blocked',evidence:'PHI_PRODUCTION_ENABLED=false'}
] as const;
