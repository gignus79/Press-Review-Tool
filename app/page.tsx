import Link from 'next/link';
import { Header } from '@/components/Header';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--tosky-dark)] mb-4">
            Press Review Tool
          </h1>
          <p className="text-xl text-[var(--tosky-text-gray)] max-w-2xl mx-auto mb-8">
            Rassegne stampa complete per artisti. Ricerca intelligente, analisi AI, export professionale.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-4 bg-[var(--tosky-primary)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
          >
            Inizia gratis
          </Link>
        </section>

        <section className="py-16 px-4 bg-[var(--tosky-light-gray)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[var(--tosky-dark)] mb-8 text-center">
              Come funziona
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-border)]">
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-bold text-[var(--tosky-dark)] mb-2">Ricerca</h3>
                <p className="text-sm text-[var(--tosky-text-gray)]">
                  Inserisci artista e/o album. Perplexity aggrega le fonti in tempo reale.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-border)]">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-bold text-[var(--tosky-dark)] mb-2">Analisi</h3>
                <p className="text-sm text-[var(--tosky-text-gray)]">
                  Categorizzazione automatica: recensioni, interviste, articoli, news.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-border)]">
                <div className="text-2xl mb-2">📄</div>
                <h3 className="font-bold text-[var(--tosky-dark)] mb-2">Export</h3>
                <p className="text-sm text-[var(--tosky-text-gray)]">
                  PDF, Excel, JSON, CSV. Report pronti per presentazioni e archivi.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 text-center">
          <Link
            href="/pricing"
            className="text-[var(--tosky-primary)] font-semibold hover:underline"
          >
            Vedi i piani →
          </Link>
        </section>
      </main>
      <footer className="py-8 border-t border-[var(--tosky-border)] text-center text-sm text-[var(--tosky-text-gray)]">
        <p>© 2026 LABELTOOLS — Powered by Tosky Records®</p>
      </footer>
    </div>
  );
}
