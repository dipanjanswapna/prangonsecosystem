'use client';

import { Home, Package, ShieldCheck, Briefcase, PenTool, User, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { ROLES, type Role } from '@/lib/roles';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const navItems = {
  [ROLES.ADMIN]: [
    { href: '/dashboard/admin', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/all-users', icon: Users, label: 'Users' },
    { href: '/dashboard/admin/donations', icon: Package, label: 'Donations' },
    { href: '#', icon: Settings, label: 'Settings' },
  ],
  [ROLES.MODERATOR]: [
    { href: '/dashboard/moderator', icon: Home, label: 'Dashboard' },
    { href: '#', icon: ShieldCheck, label: 'Moderation' },
    { href: '/auth/profile', icon: User, label: 'Profile' },
  ],
  [ROLES.MANAGER]: [
    { href: '/dashboard/manager', icon: Home, label: 'Dashboard' },
    { href: '#', icon: Briefcase, label: 'Projects' },
    { href: '/auth/profile', icon: User, label: 'Profile' },
  ],
  [ROLES.COLLABORATOR]: [
    { href: '/dashboard/collaborator', icon: Home, label: 'Dashboard' },
    { href: '#', icon: PenTool, label: 'Tasks' },
    { href: '/auth/profile', icon: User, label: 'Profile' },
  ],
  [ROLES.USER]: [
    { href: '/dashboard/user', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/user/donations', icon: Package, label: 'Donations' },
    { href: '/auth/profile', icon: User, label: 'Profile' },
  ],
};

const profileItem = { href: '/auth/profile', icon: User, label: 'Profile' };

export function DashboardBottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { data: userProfile } = useDoc<{ role: Role }>(user ? `users/${user.uid}` : null);
  const userRole = userProfile?.role || ROLES.USER;
  const items = navItems[userRole] || navItems[ROLES.USER];
  
  // For large screens
  const mainNavItems = items.slice(0, -1);
  const settingsItem = items.find(item => item.label === 'Settings');


  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
        <div className="w-full h-full overflow-x-auto whitespace-nowrap">
          <div className="flex justify-around items-center h-full min-w-max mx-auto px-2">
              {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                  <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                      buttonVariants({ variant: 'ghost', size: 'lg' }),
                      'flex flex-col items-center justify-center h-full rounded-none group text-muted-foreground pt-2 px-2 w-20',
                      isActive && 'text-primary'
                  )}
                  >
                  <item.icon className={cn('h-5 w-5 mb-1', isActive ? 'text-primary' : 'group-hover:text-foreground')} />
                  <span className="text-xs font-medium truncate">{item.label}</span>
                  </Link>
              );
              })}
          </div>
        </div>
      </div>
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-10 w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                 <Link
                    href="#"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                    <Package className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">ONGON</span>
                </Link>
                {mainNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                    <Tooltip key={item.label}>
                        <TooltipTrigger asChild>
                        <Link
                            href={item.href}
                            className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                                isActive && "bg-accent text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="sr-only">{item.label}</span>
                        </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                    )
                })}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                 {settingsItem && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Link
                            href={settingsItem.href}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                        >
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">{settingsItem.label}</span>
                        </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{settingsItem.label}</TooltipContent>
                    </Tooltip>
                )}
            </nav>
        </TooltipProvider>
      </aside>
    </>
  );
}
