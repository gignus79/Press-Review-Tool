'use client';

import type { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { SearchHistorySidebar } from '@/components/SearchHistorySidebar';
import { OnboardingWizard } from '@/components/OnboardingWizard';

export function DashboardClientShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col md:flex-row">
        <SearchHistorySidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <OnboardingWizard />
    </>
  );
}
