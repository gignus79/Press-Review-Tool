import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';
import { getClientIp, hashIp } from '@/lib/ip-guard';

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const page = typeof body.page === 'string' ? body.page.trim().slice(0, 250) : '/';
    if (!message || message.length < 3) {
      return NextResponse.json({ error: 'Feedback troppo corto' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ipHash = ip ? hashIp(ip) : null;

    await sql`
      INSERT INTO feedback (clerk_user_id, page_path, message, ip_hash)
      VALUES (${userId}, ${page || '/'}, ${message.slice(0, 2000)}, ${ipHash})
    `;

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Feedback API error', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Feedback failed' },
      { status: 500 }
    );
  }
}
