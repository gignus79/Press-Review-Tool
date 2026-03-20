import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';

const LOGO_URL = 'https://toskyrecords.com/wp-content/uploads/2022/08/Logo-Tosky-email-shop.png';

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full bg-[hsla(0,0%,100%,0.95)] text-[var(--tosky-black)] shadow-[0_0_10px_0_rgba(0,0,0,0.1)] backdrop-blur-sm"
      style={{ fontFamily: 'var(--font-prompt), sans-serif' }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={LOGO_URL}
            alt="Tosky Records"
            width={140}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--tosky-base-text)] hover:text-[var(--tosky-primary)] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-[var(--tosky-base-text)] hover:text-[var(--tosky-primary)] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[var(--tosky-base-text)] hover:text-[var(--tosky-primary)] transition-colors"
          >
            Dashboard
          </Link>
          <UserButton />
        </nav>
      </div>
    </header>
  );
}
