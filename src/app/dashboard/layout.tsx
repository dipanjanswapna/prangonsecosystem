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
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 pb-20">
            {children}
        </main>
        <DashboardBottomNav />
        {/* This div is a trick to hide the main AppFooter on dashboard routes */}
        <div className="hidden" data-purpose="footer-hider"></div>
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
