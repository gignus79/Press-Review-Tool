import { auth } from '@clerk/nextjs/server';
import { sql, ensureSchema } from '@/lib/db';
import Link from 'next/link';

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) return null;

  await ensureSchema();
  const userRow = await sql`
    SELECT id FROM users WHERE clerk_user_id = ${userId}
  `.then((r) => r[0] as { id: string } | undefined);

  if (!userRow) {
    return (
      <div className="max-w-4xl mx-auto px-3 py-8 sm:px-4 sm:py-12">
        <p className="text-[var(--tosky-text-gray)]">Utente non trovato.</p>
      </div>
    );
  }

  const searches = await sql`
    SELECT id, export_id, artist, album, results_count, created_at
    FROM searches
    WHERE user_id = ${userRow.id}
    ORDER BY created_at DESC
    LIMIT 50
  `;

  type Row = {
    id: string;
    export_id: string | null;
    artist: string | null;
    album: string | null;
    results_count: number;
    created_at: Date;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-8 sm:px-4 sm:py-12">
      <h1 className="text-xl font-bold text-[var(--tosky-dark)] mb-4 sm:text-2xl md:mb-6">
        Storico ricerche
      </h1>

      <div className="overflow-hidden rounded-lg border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] shadow-[0_2px_4px_rgba(0,0,0,0.08)] -mx-1 sm:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-[var(--tosky-header-bg)] text-left">
              <tr className="border-b border-[var(--tosky-border)]">
                <th className="p-3 font-bold text-[var(--tosky-dark)] sm:p-4">Data</th>
                <th className="p-3 font-bold text-[var(--tosky-dark)] sm:p-4">Artista</th>
                <th className="p-3 font-bold text-[var(--tosky-dark)] sm:p-4">Album</th>
                <th className="p-3 font-bold text-[var(--tosky-dark)] sm:p-4">Risultati</th>
                <th className="p-3 font-bold text-[var(--tosky-dark)] sm:p-4">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {(searches as Row[]).map((s) => {
                const params = new URLSearchParams();
                if (s.export_id) params.set('exportId', s.export_id);
                if (s.artist) params.set('artist', s.artist);
                if (s.album) params.set('album', s.album);
                const href = `/search?${params.toString()}`;
                return (
                  <tr
                    key={s.id}
                    className="border-t border-[var(--tosky-border)] text-[var(--tosky-base-text)]"
                  >
                    <td className="whitespace-nowrap p-3 text-[var(--tosky-text-gray)] sm:p-4">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 sm:p-4">{s.artist || '—'}</td>
                    <td className="p-3 sm:p-4">{s.album || '—'}</td>
                    <td className="p-3 sm:p-4">{s.results_count}</td>
                    <td className="p-3 sm:p-4">
                      {s.export_id ? (
                        <Link
                          href={href}
                          className="font-semibold text-[var(--tosky-secondary)] hover:underline"
                        >
                          Apri risultati
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {searches.length === 0 && (
          <p className="p-8 text-center text-[var(--tosky-muted)]">Nessuna ricerca ancora.</p>
        )}
      </div>
    </div>
  );
}
