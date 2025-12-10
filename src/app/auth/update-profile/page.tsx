'use client';
import { AuthLayout } from '@/app/auth/auth-layout';
import { ProfileUpdateForm } from './profile-update-form';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { Role } from '@/lib/roles';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  role: Role;
  name: string;
}

export default function UpdateProfilePage() {
  const { user, loading: userLoading } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(
    user ? `users/${user.uid}` : null
  );

  if (userLoading || profileLoading) {
    return (
      <AuthLayout
        title="Loading Profile..."
        description="Please wait while we prepare your profile form."
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </AuthLayout>
    );
  }

  if (!user || !userProfile) {
    return (
      <AuthLayout
        title="Error"
        description="Could not load user profile. Please try logging in again."
      >
        <p>User or profile not found.</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Complete Your Profile"
      description={`Welcome, ${userProfile.name}! To get started as a ${userProfile.role}, please provide some additional information.`}
    >
      <ProfileUpdateForm userProfile={userProfile} userId={user.uid} />
    </AuthLayout>
  );
}
