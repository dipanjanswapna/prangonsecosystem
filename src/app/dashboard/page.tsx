'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { ROLES, type Role } from '@/lib/roles';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardRedirectPage() {
  const { user, loading: userLoading } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<{ role: Role }>(
    user ? `users/${user.uid}` : null
  );
  const router = useRouter();

  const isLoading = userLoading || profileLoading;

  useEffect(() => {
    if (isLoading) {
      return; // Wait until user and profile data are loaded
    }

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    if (userProfile) {
      const userRole = userProfile.role || ROLES.USER;
      const expectedDashboardPath = `/dashboard/${userRole.toLowerCase()}`;
      router.replace(expectedDashboardPath);
    } else {
        // Fallback for cases where profile might not exist yet, though auth listeners should handle this.
        // Directing to user as a safe default.
        router.replace(`/dashboard/${ROLES.USER}`);
    }
  }, [user, userProfile, isLoading, router]);

  // Show a full-page loading skeleton while redirecting
  return (
     <div className="space-y-6">
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
