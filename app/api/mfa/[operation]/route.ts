import { database, identity } from '@/lib/server-access';
import { MFA } from '@/lib/mfa';
import { AccessError } from '@/lib/foundation';
import { requestBody } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ operation: string }> }) {
  try {
    const origin = process.env.CAREBRIDGE_ORIGIN || request.headers.get('origin') || new URL(request.url).origin;
    const mfaKey = process.env.MFA_ENCRYPTION_KEY || '01234567890123456789012345678901';

    const b = await requestBody(request, origin);
    const mfa = new MFA(database(), mfaKey, origin);
    const who = await identity();
    const { operation } = await params;
    let result: unknown;

    if (operation === 'totp-enroll') result = await mfa.beginTOTP(who);
    else if (operation === 'totp-verify' && typeof b.id === 'string' && typeof b.code === 'string' && /^\d{6}$/.test(b.code)) result = await mfa.verifyTOTP(who, b.id, b.code);
    else if (operation === 'recovery-generate') result = await mfa.recoveryCodes(who);
    else if (operation === 'recover' && typeof b.code === 'string' && b.code.length < 100) result = await mfa.recover(who, b.code);
    else if (operation === 'passkey-options' && ['register', 'authenticate'].includes(b.kind)) result = await mfa.options(who, b.kind);
    else if (operation === 'passkey-verify' && typeof b.id === 'string' && b.response) result = await mfa.webauthn(who, b.id, b.response);
    else if (operation === 'factors') result = await mfa.factors(who);
    else return Response.json({ error: 'INVALID_REQUEST' }, { status: 400 });

    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return Response.json({ error: 'MFA_VERIFICATION_FAILED' }, { status: e instanceof AccessError ? e.status : 400, headers: { 'Cache-Control': 'no-store' } });
  }
}
