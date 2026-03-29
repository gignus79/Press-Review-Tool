import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Prompt } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Analytics } from '@vercel/analytics/next';
import { getSiteUrl } from '@/lib/site-url';
import './globals.css';

const prompt = Prompt({
  variable: '--font-prompt',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
});

const siteUrl = getSiteUrl();
const defaultTitle = 'Press Review Tool | LabelTools';
const defaultDescription =
  'Professional music press review analysis — real-time search, AI classification, exports for labels and artists (LabelTools suite).';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: '%s | Press Review Tool',
  },
  description: defaultDescription,
  applicationName: 'Press Review Tool',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'LabelTools',
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Press Review Tool — LabelTools suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: ['/twitter-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
