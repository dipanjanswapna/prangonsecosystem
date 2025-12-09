'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { Role } from '@/lib/roles';
import { ROLES } from '@/lib/roles';

const protectedRoutes = [
  '/dashboard',
  '/auth/profile',
];

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<{ role: Role }>(
    user ? `users/${user.uid}` : null
  );
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = userLoading || profileLoading;

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!isLoading && !user) {
       // Check if the current route is a protected one
      const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
      if (isProtected) {
        router.push('/auth/login?redirect=' + pathname);
      }
      return;
    }

    // Handle dashboard redirection once user and profile are loaded
    if (!isLoading && user && userProfile) {
        const userRole = userProfile.role || ROLES.USER;
        const expectedDashboardPath = `/dashboard/${userRole.toLowerCase()}`;

        // If user is on a generic /dashboard page, redirect them to their specific role dashboard
        if (pathname === '/dashboard') {
            router.replace(expectedDashboardPath);
        }
    }

  }, [user, userProfile, isLoading, router, pathname]);

  // Show a loading skeleton while we verify the user and their profile
  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:px-6 sm:py-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // If user is authenticated, render the dashboard content
  return <>{children}</>;
}
