'use client';

import { MainNav } from './main-nav';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useState } from 'react';
import { UserNav } from './user-nav';

export function DashboardHeader() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // This header is simplified for the dashboard context.
  // We can add breadcrumbs or page titles here later.

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <div className="md:hidden flex-1">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <div className="py-6" onClick={() => setIsSheetOpen(false)}>
                {/* We'll put dashboard-specific nav here later */}
                 <p className="p-4">Dashboard Nav</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Placeholder for a search bar if needed */}
      </div>
      <div className="relative flex items-center gap-2 md:ml-auto md:grow-0">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
