import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { canExport } from '@/lib/tier-utils';

export const runtime = 'nodejs';

function flattenExportRow(r: Record<string, unknown>) {
  return {
    title: String(r.title ?? ''),
    source: String(r.source ?? ''),
    language: String(r.language ?? ''),
    date: String(r.date ?? ''),
    content_type: String(r.content_type ?? ''),
    match_score: String(r.match_score ?? ''),
    url: String(r.url ?? ''),
    description: String(r.description ?? ''),
  };
}

function escapeCsvCell(value: string): string {
  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ exportId: string; format: string }> }
) {
  try {
    await ensureSchema();
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
        { error: `Export ${format} not allowed for your plan` },
        { status: 403 }
      );
    }

    const search = await sql`
      SELECT result_data FROM searches
      WHERE export_id = ${exportId} AND user_id = ${user.id}
    `.then((r) => r[0]);

    if (!search?.result_data) {
      return NextResponse.json({ error: 'Results not found or expired' }, { status: 404 });
    }

    const data = search.result_data as {
      query: { artist?: string; album?: string };
      results: Array<Record<string, unknown>>;
    };
    const rawResults = data.results || [];
    const results = rawResults.map(flattenExportRow);
    const timestamp = Date.now();
    const filename = `review_${timestamp}.${format}`;

    if (format === 'json') {
      return new NextResponse(
        JSON.stringify({ ...data, results }, null, 2),
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        }
      );
    }

    if (format === 'csv') {
      const keys = [
        'title',
        'source',
        'language',
        'date',
        'content_type',
        'match_score',
        'url',
        'description',
      ] as const;
      const header = keys.join(',');
      const rows = results.map((r) => keys.map((k) => escapeCsvCell(r[k])).join(','));
      const BOM = '\uFEFF';
      const csv = BOM + [header, ...rows].join('\r\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === 'xlsx') {
      const ExcelJS = await import('exceljs');
      const wb = new ExcelJS.Workbook();
      wb.creator = 'Press Review Tool';
      wb.created = new Date();
      const ws = wb.addWorksheet('Results');
      const keys = [
        'title',
        'source',
        'language',
        'date',
        'content_type',
        'match_score',
        'url',
        'description',
      ] as const;
      ws.columns = keys.map((k) => ({ header: k, key: k, width: k === 'description' ? 60 : 24 }));
      if (results.length) {
        ws.addRows(results);
      } else {
        ws.addRow({ title: 'No rows' });
      }
      ws.getRow(1).font = { bold: true };
      ws.views = [{ state: 'frozen', ySplit: 1 }];
      const out = await wb.xlsx.writeBuffer();
      const bytes = new Uint8Array(out);
      return new NextResponse(bytes, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === 'pdf') {
      const { simplePdf } = await import('@/lib/pdf-export');
      const pdfBuf = await simplePdf({ ...data, results });
      return new NextResponse(new Uint8Array(pdfBuf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
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
