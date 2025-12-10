'use client';

import Link from 'next/link';
import { MainNav } from './main-nav';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useState } from 'react';
import { UserNav } from './user-nav';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'hide-on-auth'
      )}
    >
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
              <SheetHeader className="sr-only">
                <SheetTitle>Mobile Navigation Menu</SheetTitle>
              </SheetHeader>
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
          <Link href="/" className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tighter">DSP</span>
            <div className="w-px h-5 bg-foreground/50"></div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-wide leading-tight text-[0.6rem]">
                DIPANJAN
              </span>
              <span className="font-semibold tracking-wide leading-tight text-[0.6rem]">
                PRANGON
              </span>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
