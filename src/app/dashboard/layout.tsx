'use client';

import type { FC, ReactNode } from 'react';
import { AppHeader } from '@/components/app-header';
import { DashboardProvider } from '@/components/dashboard-provider';
import { DashboardBottomNav } from '@/components/dashboard-bottom-nav';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <DashboardProvider>
      <div className="relative flex min-h-screen w-full flex-col">
        <AppHeader />
        <main className="flex-1 overflow-auto p-4 md:gap-8 md:p-8">
          {children}
        </main>
        <DashboardBottomNav />
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
