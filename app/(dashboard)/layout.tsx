import { DashboardClientShell } from '@/components/DashboardClientShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardClientShell>{children}</DashboardClientShell>
    </div>
  );
}
