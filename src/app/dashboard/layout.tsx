'use client';

import type { FC, ReactNode } from 'react';
import { DashboardProvider } from '@/components/dashboard-provider';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const DashboardLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <DashboardProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] dashboard-page-active">
        <DashboardSidebar />
        <div className="flex flex-col">
           <DashboardHeader onMobileMenuClick={() => setIsMobileMenuOpen(true)} />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="p-0">
                <DashboardSidebar isMobile={true} />
            </SheetContent>
        </Sheet>
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
