import {foundation,identity} from '@/lib/server-access';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {AccessError} from '@/lib/foundation';
import {z} from 'zod';
export const dynamic='force-dynamic';
const id=z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
function reply(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
function failure(e:unknown){return reply({error:e instanceof AccessError?'ACCESS_DENIED':'UNAVAILABLE'},e instanceof AccessError?e.status:503);}
export async function GET(request:Request,{params}:{params:Promise<{operation:string}>}){
 try{if((await params).operation!=='patient')return reply({error:'NOT_IMPLEMENTED'},404);
 const parsed=id.safeParse(new URL(request.url).searchParams.get('id'));if(!parsed.success)return reply({error:'INVALID_REQUEST'},400);
 return reply(await foundation().patient(await identity(),parsed.data));}catch(e){return failure(e);}
}
export async function POST(request:Request,{params}:{params:Promise<{operation:string}>}){
 try{
 // Same-origin browser requests only; no clinical text or arbitrary object bodies accepted.
 if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'ACCESS_DENIED'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'INVALID_REQUEST'},415);
 const reader=request.body?.getReader();if(!reader)return reply({error:'INVALID_REQUEST'},400);
 let text='';const decoder=new TextDecoder();let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();return reply({error:'TOO_LARGE'},413);}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();
 let body:unknown;try{body=JSON.parse(text);}catch{return reply({error:'INVALID_REQUEST'},400);}
 const {operation}=await params;const service=foundation();
 if(operation==='login'){
  const parsed=z.object({membershipId:id}).strict().safeParse(body);if(!parsed.success)return reply({error:'INVALID_REQUEST'},400);
  const user=await getChatGPTUser();if(!user)return reply({error:'ACCESS_DENIED'},401);
  const token=await service.login(user.userId,parsed.data.membershipId);
  const response=reply({authenticated:true,mfa:'Review required',phiEnabled:false});response.headers.set('Set-Cookie',`__Host-carebridge-session=${token}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=1800`);return response;
 }
 const actor=await identity();
 if(operation==='logout'){
  if(!z.object({}).strict().safeParse(body).success)return reply({error:'INVALID_REQUEST'},400);
  await service.logout(actor);const response=reply({ok:true});response.headers.set('Set-Cookie','__Host-carebridge-session=; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return response;
 }
 if(operation==='assign-role'){
  const parsed=z.object({membershipId:id,role:z.enum(['Clinic Staff','Care Coordinator','Healthcare Professional'])}).strict().safeParse(body);if(!parsed.success)return reply({error:'INVALID_REQUEST'},400);
  await service.assignRole(actor,parsed.data.membershipId,parsed.data.role);return reply({ok:true});
 }
 if(operation==='withdraw-consent'){
  const parsed=z.object({consentId:id}).strict().safeParse(body);if(!parsed.success)return reply({error:'INVALID_REQUEST'},400);
  await service.withdrawConsent(actor,parsed.data.consentId);return reply({ok:true});
 }
 return reply({error:'NOT_IMPLEMENTED'},404);
 }catch(e){return failure(e);}
}
