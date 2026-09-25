import { database } from '@/lib/server-access';
import { demoLogin } from '@/lib/demo';
import { PHI_PRODUCTION_ENABLED } from '@/lib/governance';
import { requestBody } from '@/lib/request-body';

export async function POST(request: Request) {
  try {
    const demoEnabled = process.env.SYNTHETIC_DEMO_ENABLED !== 'false';
    const mfaKey = process.env.MFA_ENCRYPTION_KEY || '01234567890123456789012345678901';
    const origin = process.env.CAREBRIDGE_ORIGIN || request.headers.get('origin') || new URL(request.url).origin;

    if (PHI_PRODUCTION_ENABLED || !demoEnabled) {
      return Response.json({ error: 'DISABLED' }, { status: 403 });
    }

    const body = await requestBody(request, origin);
    const { token, ...info } = await demoLogin(
      database(),
      mfaKey,
      body.workspace === 'patient' ? 'patient' : 'privileged'
    );

    return Response.json(
      { ...info, label: 'Public synthetic fixture — not a staff account' },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Set-Cookie': `__Host-carebridge-demo=${token}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=1800`,
        },
      }
    );
  } catch {
    return Response.json({ error: 'UNAVAILABLE' }, { status: 503 });
  }
}
