'use client';

import Link from 'next/link';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ArrowRight, Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useState } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="md:hidden flex-1">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-6" onClick={() => setIsSheetOpen(false)}>
                  <MainNav isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-start">
            <MainNav />
          </div>

          <div className="flex-1 flex justify-center md:justify-center">
            <Link
              href="/"
              className="flex items-center gap-2"
            >
              <div className="text-center">
                <div className="font-bold text-lg tracking-wide">redottec</div>
                <div className="text-xs font-light flex items-center gap-1 text-muted-foreground">
                  by prangon ecosystem
                </div>
              </div>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Button
              variant="outline"
              className="hidden md:inline-flex rounded-full"
              asChild
            >
              <Link href="/login">
                Selfcare Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8 md:py-12">{children}</div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Dipanjan Das. The source code is available on GitHub.
          </p>
        </div>
      </footer>
    </div>
  );
}
