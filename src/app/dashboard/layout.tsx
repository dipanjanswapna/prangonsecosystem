'use client';

import type { FC, ReactNode } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardProvider } from '@/components/dashboard-provider';
import { DashboardBottomNav } from '@/components/dashboard-bottom-nav';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <DashboardProvider>
      <div className="dashboard-active flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4">
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-20 md:gap-8">
              {children}
          </main>
          <DashboardBottomNav />
        </div>
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
