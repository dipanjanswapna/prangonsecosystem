'use client';

import Link from 'next/link';
import { Icons } from './icons';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center gap-2.5">
            <Icons.logo className="w-7 h-7 text-primary" />
            <span className="font-headline text-xl font-semibold tracking-tight">
              Prangon's Eco
            </span>
          </Link>

          <div className="hidden md:flex flex-1">
            <MainNav />
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <nav className="flex items-center gap-2">
              <ThemeToggle />
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
              <UserNav />
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
