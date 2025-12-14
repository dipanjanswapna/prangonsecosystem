'use client';

import type { FC, ReactNode } from 'react';
import { DashboardProvider } from '@/components/dashboard-provider';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useState } from 'react';

const DashboardLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <DashboardProvider>
      <div className="min-h-screen w-full bg-muted/40">
        <DashboardSidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <DashboardHeader onMobileMenuClick={() => setIsMobileMenuOpen(true)} />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 sm:max-w-xs">
            <DashboardSidebar isMobile={true} onLinkClick={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
