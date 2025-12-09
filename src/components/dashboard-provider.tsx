'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { Role } from '@/lib/roles';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  const { data: userProfile, loading: profileLoading } = useDoc<{ role: Role }>(
    user ? `users/${user.uid}` : null
  );

  useEffect(() => {
    // If auth is done and there's no user, redirect to login
    if (!userLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // If we have a user but their profile is still loading, do nothing yet.
    if (user && profileLoading) {
      return;
    }

    // If we have a user and their profile is loaded
    if (user && userProfile) {
      const userRole = userProfile.role;
      const expectedPath = `/dashboard/${userRole.toLowerCase()}`;

      // If the user is on the base dashboard or a dashboard they don't have access to,
      // redirect them to their correct dashboard page.
      // We check if the pathname starts with `/dashboard` and is not the correct one.
      if (pathname.startsWith('/dashboard') && !pathname.startsWith(expectedPath)) {
         router.replace(expectedPath);
      }
    }
    
    // If the user exists but the profile does not (e.g., new registration),
    // and they are not already on the user dashboard, redirect them.
    if (user && !profileLoading && !userProfile) {
        console.warn('User profile not found in Firestore, defaulting to user dashboard.');
        if (pathname !== '/dashboard/user') {
            router.replace('/dashboard/user');
        }
    }

  }, [user, userLoading, userProfile, profileLoading, router, pathname]);

  // Show a loading skeleton while we verify the user and their role
  if (userLoading || profileLoading) {
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

  return <>{children}</>;
}
