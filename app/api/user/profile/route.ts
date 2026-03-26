import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { ensureSchema, sql } from '@/lib/db';
import { locales, type Locale } from '@/lib/i18n/dictionaries';

function normalizeLocale(v: unknown): Locale | null {
  if (typeof v !== 'string') return null;
  return locales.includes(v as Locale) ? (v as Locale) : null;
}

const ONBOARDING_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    await ensureSchema();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = (await sql`
      SELECT id, display_name, onboarding_completed, preferred_locale, created_at
      FROM users
      WHERE clerk_user_id = ${userId}
      LIMIT 1
    `) as Array<{
      id: string;
      display_name: string | null;
      onboarding_completed: boolean | null;
      preferred_locale: string | null;
      created_at: string;
    }>;

    const row = rows[0];
    if (!row) {
      return NextResponse.json({
        displayName: '',
        onboardingCompleted: false,
        preferredLocale: 'it' as Locale,
      });
    }

    const createdAt = new Date(row.created_at).getTime();
    const graceStart = Date.now() - ONBOARDING_GRACE_MS;
    const isLegacyAccount = createdAt < graceStart;

    if (!row.onboarding_completed && isLegacyAccount) {
      await sql`
        UPDATE users SET onboarding_completed = true WHERE id = ${row.id}
      `;
      const pl = normalizeLocale(row.preferred_locale) ?? 'it';
      return NextResponse.json({
        displayName: row.display_name ?? '',
        onboardingCompleted: true,
        preferredLocale: pl,
      });
    }

    const pl = normalizeLocale(row.preferred_locale) ?? 'it';
    return NextResponse.json({
      displayName: row.display_name ?? '',
      onboardingCompleted: Boolean(row.onboarding_completed),
      preferredLocale: pl,
    });
  } catch (e) {
    console.error('GET /api/user/profile', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await ensureSchema();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as {
      displayName?: string;
      completeOnboarding?: boolean;
      preferredLocale?: string;
    };

    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';

    const initialRows = (await sql`
      SELECT id, display_name, onboarding_completed, preferred_locale
      FROM users
      WHERE clerk_user_id = ${userId}
      LIMIT 1
    `) as Array<{
      id: string;
      display_name: string | null;
      onboarding_completed: boolean | null;
      preferred_locale: string | null;
    }>;

    const preferredLocalePatch = normalizeLocale(body.preferredLocale);

    if (!initialRows[0]) {
      const newId = randomUUID();
      let displayName = '';
      if (typeof body.displayName === 'string') {
        displayName = body.displayName.trim().slice(0, 120);
      }
      const onboardingCompleted = body.completeOnboarding === true;
      const pref = preferredLocalePatch ?? 'it';
      await sql`
        INSERT INTO users (id, clerk_user_id, email, tier, display_name, onboarding_completed, preferred_locale)
        VALUES (${newId}, ${userId}, ${primaryEmail}, 'free', ${displayName}, ${onboardingCompleted}, ${pref})
        ON CONFLICT (clerk_user_id) DO NOTHING
      `;
      const again = (await sql`
        SELECT id FROM users WHERE clerk_user_id = ${userId} LIMIT 1
      `) as Array<{ id: string }>;
      if (again[0]) {
        await sql`
          UPDATE users
          SET display_name = ${displayName}, onboarding_completed = ${onboardingCompleted}, preferred_locale = ${pref}
          WHERE id = ${again[0].id}
        `;
      }
      return NextResponse.json({ ok: true, displayName, onboardingCompleted, preferredLocale: pref });
    }

    const id = initialRows[0].id;
    let displayName = initialRows[0].display_name ?? '';
    if (typeof body.displayName === 'string') {
      displayName = body.displayName.trim().slice(0, 120);
    }

    let onboardingCompleted = Boolean(initialRows[0].onboarding_completed);
    if (body.completeOnboarding === true) {
      onboardingCompleted = true;
    }

    let preferredLocale: Locale =
      normalizeLocale(initialRows[0].preferred_locale) ?? 'it';
    if (preferredLocalePatch) {
      preferredLocale = preferredLocalePatch;
    }

    await sql`
      UPDATE users
      SET display_name = ${displayName}, onboarding_completed = ${onboardingCompleted}, preferred_locale = ${preferredLocale}
      WHERE id = ${id}
    `;

    return NextResponse.json({ ok: true, displayName, onboardingCompleted, preferredLocale });
  } catch (e) {
    console.error('PATCH /api/user/profile', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 }
    );
  }
}
