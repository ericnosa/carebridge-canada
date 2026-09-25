import { cookies } from 'next/headers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { Foundation, type Identity } from './foundation';
import { getD1Database, type D1Database } from './d1-database';

export function database(): D1Database {
  return getD1Database();
}

export function foundation(): Foundation {
  return new Foundation(database());
}

export async function identity(): Promise<Identity | null> {
  const cookieStore = await cookies();
  const demo = cookieStore.get('__Host-carebridge-demo')?.value;
  const demoEnabled = process.env.SYNTHETIC_DEMO_ENABLED !== 'false';
  if (demo && demoEnabled) return { subject: 'synthetic-demo-privileged', token: demo };
  const user = await getChatGPTUser();
  if (!user) return null;
  const token = cookieStore.get('__Host-carebridge-session')?.value;
  return token ? { subject: user.userId, token } : null;
}
