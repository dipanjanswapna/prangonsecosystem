'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Icons } from './icons';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <Icons.logo className="w-7 h-7 text-primary" />
            <span className="font-headline text-xl font-semibold tracking-tight">
              Prangon's Eco
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
