import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {Foundation,type Identity} from './foundation';
export function database(){if(!env.DB)throw new Error('UNAVAILABLE');return env.DB;}
export function foundation(){return new Foundation(database());}
export async function identity():Promise<Identity|null>{
 const demo=(await cookies()).get('__Host-carebridge-demo')?.value;
 if(demo && env.SYNTHETIC_DEMO_ENABLED==='true')return {subject:'synthetic-demo-privileged',token:demo};
 const user=await getChatGPTUser();if(!user)return null;
 const token=(await cookies()).get('__Host-carebridge-session')?.value;
 return token?{subject:user.userId,token}:null;
}
