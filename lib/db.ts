import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL || 'postgresql://build:build@localhost/build';

export const sql = neon(url);

/** True when DATABASE_URL is missing (build/CI); skip live DB migrations. */
function shouldSkipMigrations(): boolean {
  return !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('build:build@localhost');
}

let schemaPromise: Promise<void> | null = null;

/**
 * Creates tables on Neon if missing (idempotent).
 * Call once per process; safe to await from many places.
 */
export async function ensureSchema(): Promise<void> {
  if (shouldSkipMigrations()) return;
  if (!schemaPromise) {
    schemaPromise = runMigrations();
  }
  return schemaPromise;
}

async function runMigrations(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      clerk_user_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      tier TEXT DEFAULT 'free',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS searches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      artist TEXT,
      album TEXT,
      language TEXT,
      results_count INT,
      export_id TEXT,
      result_data JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS usage_tracking (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      month_year TEXT NOT NULL,
      search_count INT DEFAULT 0,
      UNIQUE(user_id, month_year)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS ip_user_guard (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ip_hash TEXT NOT NULL,
      clerk_user_id TEXT NOT NULL,
      month_year TEXT NOT NULL,
      first_seen TIMESTAMPTZ DEFAULT now(),
      UNIQUE(ip_hash, clerk_user_id, month_year)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS ip_user_guard_ip_month_idx
    ON ip_user_guard (ip_hash, month_year)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_user_id TEXT NOT NULL,
      page_path TEXT DEFAULT '/',
      message TEXT NOT NULL,
      ip_hash TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS feedback_user_created_idx
    ON feedback (clerk_user_id, created_at DESC)
  `;
}
