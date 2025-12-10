'use client';

import { Home, Package, ShieldCheck, Briefcase, PenTool, User, Users, Settings, HandHeart, FileDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { ROLES, type Role } from '@/lib/roles';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';

export const navItems = {
  [ROLES.ADMIN]: [
    { href: '/dashboard/admin', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/all-users', icon: Users, label: 'Users' },
    { href: '/dashboard/admin/campaigns', icon: HandHeart, label: 'Campaigns' },
    { href: '/dashboard/admin/donations', icon: Package, label: 'Donations' },
    { href: '/dashboard/admin/reports', icon: FileDown, label: 'Reports' },

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

export function DashboardBottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { data: userProfile } = useDoc<{ role: Role }>(user ? `users/${user.uid}` : null);
  const userRole = userProfile?.role || ROLES.USER;
  const items = navItems[userRole] || navItems[ROLES.USER];
  
  return (
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t sm:hidden">
        <div className="w-full h-full overflow-x-auto whitespace-nowrap">
          <div className="flex justify-around items-center h-full max-w-lg mx-auto px-2">
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
  );
}
