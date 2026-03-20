import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { buildSearchQueries } from '@/lib/perplexity';
import { runPerplexityWithFallback } from '@/lib/search-fallback';
import { categorizeResults } from '@/lib/categorize';
import { getSearchLimit } from '@/lib/tier-utils';
import { resultInDateRange, parseResultDate } from '@/lib/date-result-filter';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      artist,
      album,
      language = 'en',
      max_results = 50,
      content_filter = 'All',
      date_from: dateFromRaw,
      date_to: dateToRaw,
    } = body;

    const dateFrom =
      typeof dateFromRaw === 'string' && dateFromRaw.trim()
        ? parseResultDate(dateFromRaw.trim())
        : null;
    const dateTo =
      typeof dateToRaw === 'string' && dateToRaw.trim()
        ? parseResultDate(dateToRaw.trim())
        : null;

    if (!artist && !album) {
      return NextResponse.json(
        { error: 'Provide at least artist or album' },
        { status: 400 }
      );
    }

    const monthYear = new Date().toISOString().slice(0, 7);

    let user = await sql`
      SELECT id, tier FROM users WHERE clerk_user_id = ${userId}
    `.then((r) => r[0]);

    if (!user) {
      await sql`
        INSERT INTO users (id, clerk_user_id, email, tier)
        VALUES (${randomUUID()}, ${userId}, '', 'free')
        ON CONFLICT (clerk_user_id) DO NOTHING
      `;
      user = await sql`
        SELECT id, tier FROM users WHERE clerk_user_id = ${userId}
      `.then((r) => r[0]);
    }

    const tier = (user?.tier as 'free' | 'pro' | 'business') ?? 'free';
    const limit = getSearchLimit(tier);

    const usageResult = await sql`
      SELECT search_count FROM usage_tracking
      WHERE user_id = ${user!.id} AND month_year = ${monthYear}
    `;
    const currentCount = usageResult[0]?.search_count ?? 0;

    if (currentCount >= limit) {
      return NextResponse.json(
        { error: `Limite ricerche raggiunto (${limit}/mese). Aggiorna il piano.` },
        { status: 429 }
      );
    }

    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Perplexity API not configured' },
        { status: 503 }
      );
    }

    const queries = buildSearchQueries(artist || '', album || '');
    const rawResults = await runPerplexityWithFallback(
      queries,
      artist || '',
      album || '',
      {
        maxResults: Math.min(max_results, 100),
        language: language === 'multi' ? undefined : language,
      }
    );

    const keywords = [artist, album].filter(Boolean);
    const categorized = await categorizeResults(rawResults, keywords);

    let filtered = categorized;
    if (content_filter !== 'All') {
      const map: Record<string, string[]> = {
        'Reviews Only': ['Review'],
        'Interviews Only': ['Interview'],
        'News & Articles': ['News', 'Article'],
      };
      const allowed = map[content_filter];
      if (allowed) {
        filtered = categorized.filter((r) => allowed.includes(r.content_type));
      }
    }

    if (dateFrom || dateTo) {
      filtered = filtered.filter((r) =>
        resultInDateRange(r.date, dateFrom, dateTo, { includeUnknown: true })
      );
    }

    const exportId = randomUUID();
    const queryMeta = {
      artist,
      album,
      language,
      ...(dateFromRaw && String(dateFromRaw).trim()
        ? { date_from: String(dateFromRaw).trim() }
        : {}),
      ...(dateToRaw && String(dateToRaw).trim() ? { date_to: String(dateToRaw).trim() } : {}),
    };

    await sql`
      INSERT INTO searches (user_id, artist, album, language, results_count, export_id, result_data)
      VALUES (${user!.id}, ${artist || null}, ${album || null}, ${language}, ${filtered.length}, ${exportId}, ${JSON.stringify({ query: queryMeta, results: filtered })})
    `;

    await sql`
      INSERT INTO usage_tracking (user_id, month_year, search_count)
      VALUES (${user!.id}, ${monthYear}, 1)
      ON CONFLICT (user_id, month_year) DO UPDATE SET search_count = usage_tracking.search_count + 1
    `;

    const remaining = limit - currentCount - 1;

    return NextResponse.json({
      success: true,
      query: { artist, album, language },
      results: filtered,
      metadata: { total_found: filtered.length },
      exportId,
      remainingSearches: remaining,
    });
  } catch (e) {
    console.error('Search error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Search failed' },
      { status: 500 }
    );
  }
}
