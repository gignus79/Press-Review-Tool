import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { hasHistory } from '@/lib/tier-utils';
import Link from 'next/link';

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const userResult = await sql`
    SELECT tier FROM users WHERE clerk_user_id = ${userId}
  `;
  const tier = (userResult[0]?.tier as 'free' | 'pro' | 'business') ?? 'free';

  if (!hasHistory(tier)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-[var(--tosky-text-gray)]">
          Lo storico ricerche è disponibile per i piani Pro e Business.{' '}
          <Link href="/pricing" className="text-[var(--tosky-primary)] hover:underline">
            Aggiorna il piano
          </Link>
        </p>
      </div>
    );
  }

  const userRow = await sql`SELECT id FROM users WHERE clerk_user_id = ${userId}`.then((r) => r[0]);
  if (!userRow) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-[var(--tosky-text-gray)]">Utente non trovato.</p>
      </div>
    );
  }

  const searches = await sql`
    SELECT id, artist, album, results_count, created_at
    FROM searches
    WHERE user_id = ${userRow.id}
    ORDER BY created_at DESC
    LIMIT 50
  `;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-[var(--tosky-dark)] mb-6">
        Storico ricerche
      </h1>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--tosky-header-bg)]">
            <tr>
              <th className="text-left p-4 font-bold">Data</th>
              <th className="text-left p-4 font-bold">Artista</th>
              <th className="text-left p-4 font-bold">Album</th>
              <th className="text-left p-4 font-bold">Risultati</th>
            </tr>
          </thead>
          <tbody>
            {(searches as Array<{ id: string; artist: string | null; album: string | null; results_count: number; created_at: Date }>).map((s) => (
              <tr key={s.id} className="border-t border-[var(--tosky-border)]">
                <td className="p-4 text-[var(--tosky-text-gray)]">
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">{s.artist || '-'}</td>
                <td className="p-4">{s.album || '-'}</td>
                <td className="p-4">{s.results_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {searches.length === 0 && (
          <p className="p-8 text-center text-[var(--tosky-muted)]">
            Nessuna ricerca ancora.
          </p>
        )}
      </div>
    </div>
  );
}
