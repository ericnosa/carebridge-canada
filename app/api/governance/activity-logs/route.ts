import { foundation, identity } from '@/lib/server-access';
import { AccessError } from '@/lib/foundation';
import { blockedResponse } from '@/lib/release-policy';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await foundation().getActivityLogs(await identity());
    return Response.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof AccessError ? 'ACCESS_DENIED' : 'UNAVAILABLE' },
      { status: error instanceof AccessError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export const POST = blockedResponse;
export const PUT = blockedResponse;
export const PATCH = blockedResponse;
export const DELETE = blockedResponse;
