import {releasePolicy} from '@/lib/release-policy';
import {readinessRegister} from '@/lib/readiness';
export function GET(){return Response.json({...releasePolicy,requirements:readinessRegister},{headers:{'Cache-Control':'no-store'}});}
