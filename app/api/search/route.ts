import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { buildSearchQueries } from '@/lib/perplexity';
import { runPerplexityWithFallback } from '@/lib/search-fallback';
import { categorizeResults } from '@/lib/categorize';
import { getSearchLimit } from '@/lib/tier-utils';
import { resultInDateRange, parseResultDate } from '@/lib/date-result-filter';
import { FREE_ACCOUNTS_PER_IP_LIMIT, getClientIp, hashIp } from '@/lib/ip-guard';
import { freeTierAbuseIdentityKey } from '@/lib/email-identity';
import {
  coerceContentFilter,
  coerceMaxResults,
  coerceSearchTextField,
  sanitizePhraseForQuery,
} from '@/lib/search-input';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 120;

const ALLOWED_SEARCH_LANG = new Set(['en', 'it', 'es', 'fr', 'multi']);

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const dateFromRaw = body.date_from;
    const dateToRaw = body.date_to;

    const artist = sanitizePhraseForQuery(coerceSearchTextField(body.artist));
    const album = sanitizePhraseForQuery(coerceSearchTextField(body.album));
    const language =
      typeof body.language === 'string' && ALLOWED_SEARCH_LANG.has(body.language)
        ? body.language
        : 'en';
    const max_results = coerceMaxResults(body.max_results);
    const content_filter = coerceContentFilter(body.content_filter);

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

    if (tier === 'free') {
      const clientIp = getClientIp(req);
      if (clientIp) {
        const clerkUser = await currentUser();
        const primaryFromClerk =
          clerkUser?.primaryEmailAddress?.emailAddress ??
          clerkUser?.emailAddresses?.[0]?.emailAddress ??
          '';
        if (primaryFromClerk && user) {
          await sql`
            UPDATE users
            SET email = ${primaryFromClerk}
            WHERE id = ${user.id}
              AND (
                email IS NULL
                OR TRIM(email) = ''
                OR LOWER(TRIM(email)) <> LOWER(TRIM(${primaryFromClerk}))
              )
          `;
        }

        const ipHash = hashIp(clientIp);
        await sql`
          INSERT INTO ip_user_guard (ip_hash, clerk_user_id, month_year)
          VALUES (${ipHash}, ${userId}, ${monthYear})
          ON CONFLICT (ip_hash, clerk_user_id, month_year) DO NOTHING
        `;
        const ipRows = await sql`
          SELECT g.clerk_user_id, u.email
          FROM ip_user_guard g
          INNER JOIN users u ON u.clerk_user_id = g.clerk_user_id
          WHERE g.ip_hash = ${ipHash} AND g.month_year = ${monthYear}
        `;
        const identityKeys = new Set<string>();
        for (const row of ipRows as { clerk_user_id: string; email: string }[]) {
          identityKeys.add(freeTierAbuseIdentityKey(row.email, row.clerk_user_id));
        }
        const usersFromIp = identityKeys.size;
        if (usersFromIp > FREE_ACCOUNTS_PER_IP_LIMIT) {
          console.warn('[SECURITY][IP_LIMIT_REACHED]', {
            userId,
            monthYear,
            usersFromIp,
            limit: FREE_ACCOUNTS_PER_IP_LIMIT,
          });
          return NextResponse.json(
            {
              code: 'IP_LIMIT_REACHED',
              error:
                'Troppi account free dallo stesso IP questo mese. Passa a Pro oppure contatta il supporto.',
            },
            { status: 429 }
          );
        }
      }
    }

    const usageResult = await sql`
      SELECT search_count FROM usage_tracking
      WHERE user_id = ${user!.id} AND month_year = ${monthYear}
    `;
    const currentCount = usageResult[0]?.search_count ?? 0;

    if (currentCount >= limit) {
      console.warn('[SECURITY][FREE_LIMIT_REACHED]', {
        userId,
        monthYear,
        currentCount,
        limit,
      });
      return NextResponse.json(
        {
          code: 'FREE_LIMIT_REACHED',
          error: `Limite ricerche raggiunto (${limit}/mese). Aggiorna il piano.`,
        },
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
