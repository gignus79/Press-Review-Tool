import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { canExport } from '@/lib/tier-utils';
import * as XLSX from 'xlsx';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ exportId: string; format: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { exportId, format } = await params;

    if (!['pdf', 'xlsx', 'json', 'csv'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    const user = await sql`
      SELECT id, tier FROM users WHERE clerk_user_id = ${userId}
    `.then((r) => r[0]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tier = (user.tier as 'free' | 'pro' | 'business') ?? 'free';
    if (!canExport(tier, format)) {
      return NextResponse.json(
        { error: `Export ${format} non disponibile per il tuo piano` },
        { status: 403 }
      );
    }

    const search = await sql`
      SELECT result_data FROM searches
      WHERE export_id = ${exportId} AND user_id = ${user.id}
    `.then((r) => r[0]);

    if (!search?.result_data) {
      return NextResponse.json({ error: 'Risultati non trovati o scaduti' }, { status: 404 });
    }

    const data = search.result_data as { query: { artist?: string; album?: string }; results: Array<Record<string, unknown>> };
    const results = data.results || [];

    if (format === 'json') {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="review_${Date.now()}.json"`,
        },
      });
    }

    if (format === 'csv') {
      const keys = ['title', 'source', 'language', 'date', 'content_type', 'relevance', 'url', 'description'];
      const header = keys.join(',');
      const rows = results.map((r) =>
        keys.map((k) => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(',')
      );
      const csv = [header, ...rows].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="review_${Date.now()}.csv"`,
        },
      });
    }

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(results);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Results');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="review_${Date.now()}.xlsx"`,
        },
      });
    }

    if (format === 'pdf') {
      const { simplePdf } = await import('@/lib/pdf-export');
      const pdfBuf = await simplePdf(data);
      return new NextResponse(new Uint8Array(pdfBuf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="review_${Date.now()}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown format' }, { status: 400 });
  } catch (e) {
    console.error('Export error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Export failed' },
      { status: 500 }
    );
  }
}
