import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';

export async function GET() {
  try {
    await ensureSchema();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const userRow = await sql`
      SELECT id FROM users WHERE clerk_user_id = ${userId}
    `.then((r) => r[0] as { id: string } | undefined);

    if (!userRow) {
      return NextResponse.json({ searches: [] }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const searches = await sql`
      SELECT export_id, artist, album, results_count, created_at
      FROM searches
      WHERE user_id = ${userRow.id}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({
      searches: searches as Array<{
        export_id: string | null;
        artist: string | null;
        album: string | null;
        results_count: number | null;
        created_at: Date;
      }>,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('History API:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
