'use client';

import type { FC, ReactNode } from 'react';
import { DashboardProvider } from '@/components/dashboard-provider';
import { AppHeader } from '@/components/app-header';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <DashboardProvider>
      <div className="relative flex min-h-screen w-full flex-col bg-muted/40">
        <AppHeader />
        <main className="flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
