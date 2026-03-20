import { Header } from '@/components/Header';
import { SearchHistorySidebar } from '@/components/SearchHistorySidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 flex-col md:flex-row">
        <SearchHistorySidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
