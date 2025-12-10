'use client';

import type { FC, ReactNode } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardProvider } from '@/components/dashboard-provider';
import { DashboardBottomNav } from '@/components/dashboard-bottom-nav';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <DashboardProvider>
      <div className="dashboard-active flex min-h-screen w-full bg-muted/40">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6 pb-20 sm:pb-6 md:gap-8">
              {children}
          </main>
        </div>
        <DashboardBottomNav />
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
