import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Prompt } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const prompt = Prompt({
  variable: '--font-prompt',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Press Review Tool | Tosky Records®',
  description: 'Professional music press review analysis. Rassegne stampa complete per artisti.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={prompt.variable} suppressHydrationWarning>
        <body className="min-h-full flex flex-col font-[family-name:var(--font-prompt)] antialiased">
          <Providers>{children}</Providers>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
