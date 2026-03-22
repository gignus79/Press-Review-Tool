import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ exportId: string }> }
) {
  try {
    await ensureSchema();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const { exportId } = await params;
    if (!exportId) {
      return NextResponse.json(
        { error: 'Missing exportId' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const userRow = await sql`
      SELECT id FROM users WHERE clerk_user_id = ${userId}
    `.then((r) => r[0] as { id: string } | undefined);

    if (!userRow) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const row = await sql`
      SELECT result_data FROM searches
      WHERE export_id = ${exportId} AND user_id = ${userRow.id}
    `.then((r) => r[0] as { result_data: unknown } | undefined);

    if (!row?.result_data) {
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const payload = row.result_data as {
      query: Record<string, unknown>;
      results: unknown[];
    };

    return NextResponse.json({
      exportId,
      query: payload.query,
      results: payload.results,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Search by exportId:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
