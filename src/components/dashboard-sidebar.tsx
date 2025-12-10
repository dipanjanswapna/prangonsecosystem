'use client';

import Link from 'next/link';
import { HandHeart, Settings, Package2 } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { ROLES, type Role } from '@/lib/roles';
import { cn } from '@/lib/utils';
import { navItems } from './dashboard-bottom-nav';
import { usePathname } from 'next/navigation';

export function DashboardSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { data: userProfile } = useDoc<{ role: Role }>(
    user ? `users/${user.uid}` : null
  );
  const userRole = userProfile?.role || ROLES.USER;
  const items = navItems[userRole] || navItems[ROLES.USER];

  const linkClasses = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
      isActive && 'bg-muted text-primary'
    );
    
  const mobileLinkClasses = (isActive: boolean) => cn(
    'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
    isActive && 'text-foreground'
  );

  if (isMobile) {
    return (
      <nav className="grid gap-6 text-lg font-medium">
        <Link
          href="/"
          className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
        >
          <HandHeart className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">ONGON</span>
        </Link>
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href} className={mobileLinkClasses(isActive)}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="hidden border-r bg-muted/40 sm:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <HandHeart className="h-6 w-6 text-primary" />
            <span className="">ONGON</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={linkClasses(isActive)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
