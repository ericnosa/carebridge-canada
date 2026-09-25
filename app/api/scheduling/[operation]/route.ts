import { database, identity } from '@/lib/server-access';
import { Scheduling } from '@/lib/scheduling';
import { AccessError } from '@/lib/foundation';
import { requestBody } from '@/lib/request-body';
import { z } from 'zod';

const id = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const version = z.number().int().positive();

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ operation: string }> }) {
  try {
    const origin = process.env.CAREBRIDGE_ORIGIN || request.headers.get('origin') || new URL(request.url).origin;
    const b = await requestBody(request, origin);
    const s = new Scheduling(database());
    const who = await identity();
    const { operation } = await params;
    let result: unknown;

    if (operation === 'mine') {
      z.object({}).strict().parse(b);
      result = await s.mine(who);
    } else if (operation === 'slots') {
      z.object({}).strict().parse(b);
      result = await s.slots(who);
    } else if (operation === 'book') {
      const v = z.object({ patientId: id, slotId: id, idempotencyKey: id, version }).strict().parse(b);
      result = await s.book(who, v.patientId, v.slotId, v.idempotencyKey, v.version);
    } else if (operation === 'view') {
      const v = z.object({ id }).strict().parse(b);
      result = await s.view(who, v.id);
    } else if (operation === 'reschedule') {
      const v = z.object({ id, slotId: id, version }).strict().parse(b);
      result = await s.change(who, v.id, v.version, v.slotId);
    } else if (operation === 'cancel') {
      const v = z.object({ id, version }).strict().parse(b);
      result = await s.change(who, v.id, v.version);
    } else {
      return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return Response.json(
      { error: 'REQUEST_DENIED_OR_CONFLICT' },
      { status: e instanceof AccessError ? e.status : 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
