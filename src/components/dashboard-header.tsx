'use client';

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Home, Users, Shield, Briefcase, GitBranch, User, Menu, Settings, Package2 } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useState, useMemo } from 'react';
import { UserNav } from './user-nav';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { roleHierarchy, type Role } from '@/lib/roles';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  requiredRoleLevel: number;
};

const allNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: Home, requiredRoleLevel: roleHierarchy.user },
  { href: '/dashboard/admin', label: 'Admin', icon: Users, requiredRoleLevel: roleHierarchy.admin },
  { href: '/dashboard/moderator', label: 'Moderator', icon: Shield, requiredRoleLevel: roleHierarchy.moderator },
  { href: '/dashboard/manager', label: 'Manager', icon: Briefcase, requiredRoleLevel: roleHierarchy.manager },
  { href: '/dashboard/collaborator', label: 'Collaborator', icon: GitBranch, requiredRoleLevel: roleHierarchy.collaborator },
  { href: '/dashboard/user', label: 'My Dashboard', icon: User, requiredRoleLevel: roleHierarchy.user },
];

export function DashboardHeader() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading: userLoading } = useUser();
  const { data: userData, loading: userDataLoading } = useDoc<{ role: Role }>(
    user?.uid ? `users/${user.uid}` : ''
  );

  const userRoleLevel = useMemo(() => {
    if (!userData?.role) return -1;
    return roleHierarchy[userData.role] ?? -1;
  }, [userData]);
  
  const navItems = useMemo(() => {
    return allNavItems.filter(item => userRoleLevel >= item.requiredRoleLevel);
  }, [userRoleLevel]);

  const isLoading = userLoading || userDataLoading;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <div className="sm:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <span className="font-extrabold text-sm tracking-tighter">DSP</span>
                  <span className="sr-only">Prangons Ecosystem</span>
                </Link>
                {isLoading ? (
                  <>
                    <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
                    <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
                    <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
                  </>
                ) : (
                  navItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                        pathname === item.href && "text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))
                )}
                 <Link
                    href="/auth/profile"
                    onClick={() => setIsSheetOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                       pathname === "/auth/profile" && "text-foreground"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Placeholder for a search bar if needed */}
      </div>
      <div className="relative flex items-center gap-2 md:ml-auto md:grow-0">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
