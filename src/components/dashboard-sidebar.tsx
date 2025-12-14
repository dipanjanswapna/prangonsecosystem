'use client';

import Link from 'next/link';
import { HandHeart, Settings } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { ROLES, type Role } from '@/lib/roles';
import { cn } from '@/lib/utils';
import { navItems } from './dashboard-bottom-nav';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

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
    isActive && 'bg-muted text-foreground'
  );

  const content = (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <HandHeart className="h-6 w-6 text-primary" />
          <span>ONGON</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
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
      <div className="mt-auto p-4">
        <Card>
          <CardHeader className="p-2 pt-0 md:p-4">
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>
              Unlock all features and get unlimited access to our support
              team.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
            <Button size="sm" className="w-full">
              Upgrade
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isMobile) {
    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                <HandHeart className="h-6 w-6 text-primary" />
                <span className="">ONGON</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
                 <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
                    {items.map((item) => {
                    const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
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
    );
  }

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      {content}
    </div>
  );
}
