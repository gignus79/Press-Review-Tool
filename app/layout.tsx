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
  title: 'Press Review Tool | LabelTools',
  description:
    'Professional music press review analysis — real-time search, AI classification, exports for labels and artists (LabelTools suite).',
};

const clerkAfterSignOutUrl =
  process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL ?? '/dashboard';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl={clerkAfterSignOutUrl}>
      <html lang="en" className={prompt.variable} suppressHydrationWarning>
        <body className="min-h-full flex flex-col font-[family-name:var(--font-prompt)] antialiased">
          <Providers>{children}</Providers>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
