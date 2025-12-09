import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* The main header is included in the root layout, so we might not need another one here,
          or we might want a specific dashboard topbar instead. For now, we'll keep it simple.
          If a topbar is needed, it would go here. */}
      <main className="flex-1">
        {/* A sidebar could be added here */}
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
