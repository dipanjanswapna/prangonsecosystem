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
      <div className="flex min-h-screen w-full flex-col bg-muted/40 pb-24 md:pb-0">
        <div className="flex flex-col sm:gap-4 sm:py-4">
          <DashboardHeader />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
        <div className="md:hidden">
            <DashboardBottomNav />
        </div>
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
