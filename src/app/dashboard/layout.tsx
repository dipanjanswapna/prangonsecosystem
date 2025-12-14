'use client';

import type { FC, ReactNode } from 'react';
import { DashboardProvider } from '@/components/dashboard-provider';
import { DashboardBottomNav } from '@/components/dashboard-bottom-nav';
import { DashboardHeader } from '@/components/dashboard-header';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <DashboardProvider>
      <div className="dashboard-active h-screen w-full flex flex-col bg-muted/40 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-8 pb-20 overflow-auto">
          {children}
        </main>
        <DashboardBottomNav />
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
