'use client';

import Link from 'next/link';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ArrowRight, Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="hidden md:flex flex-1 items-center justify-start">
            <MainNav />
          </div>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
          >
            <div className="text-center">
              <div className="font-bold text-xl tracking-wide">redottec</div>
              <div className="text-xs font-light flex items-center gap-1 text-muted-foreground">
                by prangon ecosystem
              </div>
            </div>
          </Link>

          <div className="flex-1 md:hidden">
            {/* Placeholder for mobile layout to balance the flexbox */}
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <nav className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden md:inline-flex rounded-full"
              >
                Selfcare Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <ThemeToggle />
              <UserNav />
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <div className="py-6">
                      <MainNav isMobile={true} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">{children}</div>
      </main>
    </div>
  );
}
