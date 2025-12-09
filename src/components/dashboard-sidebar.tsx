'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Shield,
  Briefcase,
  GitBranch,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { roleHierarchy, type Role } from '@/lib/roles';
import { useMemo } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  requiredRoleLevel: number;
  exact?: boolean;
};

const allNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, requiredRoleLevel: roleHierarchy.user, exact: true },
  // These links can be added back if you create specific pages for these roles under different routes
  // { href: '/dashboard/admin', label: 'Admin', icon: Users, requiredRoleLevel: roleHierarchy.admin },
  // { href: '/dashboard/moderator', label: 'Moderator', icon: Shield, requiredRoleLevel: roleHierarchy.moderator },
  // { href: '/dashboard/manager', label: 'Manager', icon: Briefcase, requiredRoleLevel: roleHierarchy.manager },
  // { href: '/dashboard/collaborator', label: 'Collaborator', icon: GitBranch, requiredRoleLevel: roleHierarchy.collaborator },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, loading: userLoading } = useUser();
  const { data: userData, loading: userDataLoading } = useDoc<{ role: Role }>(
    user?.uid ? `users/${user.uid}` : null
  );

  const userRoleLevel = useMemo(() => {
    if (userDataLoading || !userData?.role) return -1;
    return roleHierarchy[userData.role] ?? -1;
  }, [userData, userDataLoading]);
  
  const navItems = useMemo(() => {
    if (userRoleLevel < 0) return [];
    return allNavItems.filter(item => userRoleLevel >= item.requiredRoleLevel);
  }, [userRoleLevel]);

  const isLoading = userLoading || userDataLoading;

  const isLinkActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
             <span className="font-extrabold text-sm tracking-tighter">DSP</span>
            <span className="sr-only">Prangons Ecosystem</span>
          </Link>

          {isLoading ? (
             <div className="flex flex-col items-center gap-4 mt-4">
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            </div>
          ) : (
            navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                      isLinkActive(item) && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))
          )}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/auth/profile"
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                  pathname === '/auth/profile' && 'bg-accent text-accent-foreground'
                )}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
