'use client';

import Link from 'next/link';
import { Icons } from './icons';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ArrowRight, Flame, Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-purple-700 via-purple-600 to-blue-600 shadow-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="hidden md:flex flex-1 items-center justify-start">
            <MainNav />
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5">
            <div className='text-primary-foreground text-center'>
              <div className="font-bold text-2xl tracking-wide">redottec</div>
              <div className="text-xs font-light flex items-center gap-1">
                by prangon ecosystem
              </div>
            </div>
          </Link>
          
          <div className="flex-1 md:hidden">
             {/* Placeholder for mobile layout to balance the flexbox */}
          </div>


          <div className="flex flex-1 items-center justify-end gap-2">
            <nav className="flex items-center gap-2">
              <Button variant="outline" className='hidden md:inline-flex rounded-full bg-transparent text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10 hover:text-primary-foreground'>
                Selfcare Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <ThemeToggle />
              <UserNav />
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'>
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
