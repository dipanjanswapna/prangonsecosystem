'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { ROLES, type Role } from '@/lib/roles';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardRedirect() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { data: userProfile, loading: profileLoading } = useDoc<{ role: Role }>(
    user ? `users/${user.uid}` : null
  );

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!profileLoading && userProfile) {
      const userRole = userProfile.role || ROLES.USER;
      // Redirect to the role-specific dashboard
      router.push(`/dashboard/${userRole.toLowerCase()}`);
    }
  }, [user, userLoading, userProfile, profileLoading, router]);

  // Loading state
  return (
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
  );
}
