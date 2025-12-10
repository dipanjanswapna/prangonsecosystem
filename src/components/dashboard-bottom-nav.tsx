'use client';

import { Home, Package, ShieldCheck, Briefcase, PenTool, User, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { ROLES, type Role } from '@/lib/roles';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';

const navItems = {
  [ROLES.ADMIN]: [
    { href: '/dashboard/admin', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/all-users', icon: Users, label: 'Users' },
    { href: '#', icon: Package, label: 'Analytics' },
    { href: '#', icon: Settings, label: 'Settings' },
    { href: '/auth/profile', icon: User, label: 'Profile' },
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
    <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-background border-t">
      <div className={`grid h-full grid-cols-${items.length} mx-auto`}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'lg' }),
                'flex flex-col items-center justify-center h-full rounded-none group text-muted-foreground',
                isActive && 'text-primary bg-primary/10'
              )}
            >
              <item.icon className={cn('h-6 w-6 mb-1', isActive ? 'text-primary' : 'group-hover:text-foreground')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
