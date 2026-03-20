import Link from 'next/link';
import { Header } from '@/components/Header';
import { PricingCards } from '@/components/PricingCards';

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold text-[var(--tosky-dark)] mb-4">
            Piani e prezzi
          </h1>
          <p className="text-[var(--tosky-text-gray)]">
            Scegli il piano adatto alle tue esigenze. Inizia gratis, scala quando serve.
          </p>
        </div>
        <PricingCards />
      </main>
      <footer className="py-8 border-t border-[var(--tosky-border)] text-center text-sm text-[var(--tosky-text-gray)]">
        <p>© 2026 LABELTOOLS — Powered by Tosky Records®</p>
      </footer>
    </div>
  );
}
