import {foundation,identity} from '@/lib/server-access';
import {AccessError} from '@/lib/foundation';
import {blockedResponse} from '@/lib/release-policy';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{section:string}>}){
 const {section}=await params;const key=section==='readiness'?'governance/readiness':section;
 try {return Response.json({counts:await foundation().summary(await identity(),key),phiEnabled:false},{headers:{'Cache-Control':'no-store'}});}
 catch(error){return Response.json({error:error instanceof AccessError?'ACCESS_DENIED':'UNAVAILABLE'},{status:error instanceof AccessError?error.status:503,headers:{'Cache-Control':'no-store'}});}
}
export const POST=blockedResponse;export const PUT=blockedResponse;export const PATCH=blockedResponse;export const DELETE=blockedResponse;
