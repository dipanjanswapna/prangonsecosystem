'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { ROLES, type Role } from '@/lib/roles';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardRedirect() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    // If user is not logged in after loading, redirect to login
    if (!userLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // If we have a user, fetch their profile to determine role
    if (user) {
      const fetchUserProfile = async () => {
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userProfile = userDocSnap.data() as { role: Role };
            const userRole = userProfile.role || ROLES.USER;
            // Redirect to the role-specific dashboard
            router.push(`/dashboard/${userRole.toLowerCase()}`);
          } else {
            // If profile doesn't exist, maybe they are a new user. Default to user dashboard.
             console.warn('User profile not found in Firestore, defaulting to user dashboard.');
             router.push(`/dashboard/user`);
          }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // On error, maybe redirect to a generic error page or user dashboard
            router.push('/dashboard/user');
        }
      };

      fetchUserProfile();
    }
  }, [user, userLoading, router, firestore]);

  // Loading state
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center space-x-4">
         <Skeleton className="h-12 w-12 rounded-full" />
         <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
         </div>
      </div>
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Redirecting to your dashboard...</h2>
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
