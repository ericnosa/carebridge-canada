import {PHI_PRODUCTION_ENABLED} from './governance';
export const releasePolicy = Object.freeze({ mode: 'synthetic-demo', phiEnabled: PHI_PRODUCTION_ENABLED, liveCareEnabled: false, externalClinicalConnections: 0, productionStatus: 'blocked' });
export function blockedResponse() { return Response.json({ error: 'PHI_DISABLED', message: 'Real patient data and live healthcare operations are disabled in this demonstration.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } }); }
