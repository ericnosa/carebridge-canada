import {env} from 'cloudflare:workers';
import {database} from '@/lib/server-access';
import {demoLogin} from '@/lib/demo';
import {PHI_PRODUCTION_ENABLED} from '@/lib/governance';
import {requestBody} from '@/lib/request-body';
export async function POST(request:Request){try{if(PHI_PRODUCTION_ENABLED||env.SYNTHETIC_DEMO_ENABLED!=='true'||!env.MFA_ENCRYPTION_KEY||!env.CAREBRIDGE_ORIGIN)return Response.json({error:'DISABLED'},{status:403});const body=await requestBody(request,env.CAREBRIDGE_ORIGIN);const {token,...info}=await demoLogin(database(),env.MFA_ENCRYPTION_KEY,body.workspace==='patient'?'patient':'privileged');return Response.json({...info,label:'Public synthetic fixture — not a staff account'},{headers:{'Cache-Control':'no-store','Set-Cookie':`__Host-carebridge-demo=${token}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=1800`}});}catch{return Response.json({error:'UNAVAILABLE'},{status:503});}}
