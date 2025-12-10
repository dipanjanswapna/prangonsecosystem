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
import { logOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const navItems = {
  [ROLES.ADMIN]: [
    { href: '/dashboard/admin', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/all-users', icon: Users, label: 'Users' },
    { href: '#', icon: Package, label: 'Analytics' },
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
  const router = useRouter();
  const { user } = useUser();
  const { data: userProfile } = useDoc<{ role: Role }>(
    user ? `users/${user.uid}` : null
  );
  const userRole = userProfile?.role || ROLES.USER;

  const items = navItems[userRole] || navItems[ROLES.USER];
  
  const handleLogout = async () => {
    await logOut();
    router.push('/');
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
         {items.map((item) => (
          <Link
            href={item.href}
            key={item.label}
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 group",
              pathname.startsWith(item.href) && item.href !== '#' ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
         <button
            type="button"
            onClick={handleLogout}
            className="inline-flex flex-col items-center justify-center px-5 text-muted-foreground hover:bg-muted/50 group"
        >
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
}
