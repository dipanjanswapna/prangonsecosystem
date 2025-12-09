'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function DashboardRedirectPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (loading || !firestore) {
      return;
    }
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchUserRole = async () => {
      if (!user) return;
      const userDocRef = doc(firestore, 'users', user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role || 'user';
          // Redirect to the role-specific dashboard
          router.push(`/dashboard/${role}`);
        } else {
          // Fallback or handle error if user doc doesn't exist
          console.warn("User document not found in Firestore. Defaulting to user dashboard.");
          router.push('/dashboard/user');
        }
      } catch (error) {
          console.error("Error fetching user role: ", error);
          // Handle error, maybe redirect to a generic dashboard or an error page
          router.push('/dashboard/user');
      }
    };

    fetchUserRole();
  }, [user, loading, router, firestore]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
