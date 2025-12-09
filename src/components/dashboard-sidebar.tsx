'use client';

import {
  Home,
  Users,
  Package,
  Settings,
  ShieldCheck,
  Briefcase,
  PenTool,
  LogOut,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { ROLES, type Role } from '@/lib/roles';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const navItems = {
  [ROLES.ADMIN]: [
    { href: '/dashboard/admin', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/all-users', icon: Users, label: 'Users' },
    { href: '#', icon: Package, label: 'Analytics' },
    { href: '#', icon: Settings, label: 'Settings' },
  ],
  [ROLES.MODERATOR]: [
    { href: '/dashboard/moderator', icon: Home, label: 'Dashboard' },
    { href: '#', icon: ShieldCheck, label: 'Content Moderation' },
  ],
  [ROLES.MANAGER]: [
    { href: '/dashboard/manager', icon: Home, label: 'Dashboard' },
    { href: '#', icon: Briefcase, label: 'Projects' },
  ],
  [ROLES.COLLABORATOR]: [
    { href: '/dashboard/collaborator', icon: Home, label: 'Dashboard' },
    { href: '#', icon: PenTool, label: 'Tasks' },
  ],
  [ROLES.USER]: [
    { href: '/dashboard/user', icon: Home, label: 'Dashboard' },
    { href: '/auth/profile', icon: User, label: 'Profile' },
  ],
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { data: userProfile } = useDoc<{ role: Role }>(
    user ? `users/${user.uid}` : null
  );
  const userRole = userProfile?.role || ROLES.USER;

  const items = navItems[userRole] || navItems[ROLES.USER];

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <span className="text-sm font-bold">DSP</span>
            <span className="sr-only">Prangons Ecosystem</span>
          </Link>
          {items.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                    pathname.startsWith(item.href) && 'bg-accent text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
