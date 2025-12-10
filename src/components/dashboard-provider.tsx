'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { Role } from '@/lib/roles';
import { ROLES } from '@/lib/roles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { logOut } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/auth/profile'];

interface UserProfile {
  role: Role;
  status: 'pending' | 'approved' | 'rejected';
}

function AccessDenied({ status }: { status: 'pending' | 'rejected' }) {
    const router = useRouter();
    
    const handleLogoutAndRedirect = async () => {
      await logOut();
      // No need to push router, logout logic already handles redirection via page refresh
    };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-muted rounded-full p-3 w-fit">
            {status === 'pending' ? (
              <Clock className="h-10 w-10 text-primary" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-destructive" />
            )}
          </div>
          <CardTitle className="mt-4">
            {status === 'pending' ? 'Access Pending' : 'Access Denied'}
          </CardTitle>
          <CardDescription>
            {status === 'pending'
              ? 'Your account is currently awaiting admin approval. You will receive an email once your account has been reviewed. Thank you for your patience.'
              : 'Your registration was not approved. If you believe this is an error, please contact support.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <Button onClick={handleLogoutAndRedirect}>
                Back to Home
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(
    user ? `users/${user.uid}` : null
  );
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = userLoading || profileLoading;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  useEffect(() => {
    // If it's not a protected route, do nothing.
    if (!isProtectedRoute) {
      return;
    }
    
    // If user data is still loading, wait.
    if (isLoading) {
      return;
    }

    // After loading, if there's no user, redirect to login.
    if (!user) {
      router.push('/auth/login?redirect=' + pathname);
      return;
    }
    
    // If there is a user, but the profile hasn't loaded or doesn't exist, wait. 
    // This state should be brief. If it persists, it indicates a Firestore issue.
    if (!userProfile) {
        // Fallback for safety, but this indicates a potential issue in user creation.
        // It's better to show loading until the profile is confirmed.
        return;
    }

    // If the profile is loaded and the status is approved, handle role-based redirection.
    if (userProfile.status === 'approved') {
        const userRole = userProfile.role || ROLES.USER;
        const expectedDashboardPath = `/dashboard/${userRole.toLowerCase()}`;
        
        // If they land on the base /dashboard, redirect them to their specific role dashboard.
        if (pathname === '/dashboard' || pathname === '/dashboard/') {
            router.replace(expectedDashboardPath);
        }
    }

  }, [user, userProfile, isLoading, router, pathname, isProtectedRoute]);

  // While loading, show a skeleton UI on protected routes.
  if (isProtectedRoute && (isLoading || (user && !userProfile))) {
    return (
      <div className="space-y-6 p-4 sm:px-6 sm:py-4">
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

  // If on a protected route and the user profile is loaded and status is not 'approved', show AccessDenied.
  if (isProtectedRoute && user && userProfile && userProfile.status !== 'approved') {
    return <AccessDenied status={userProfile.status} />;
  }
  
  // If not a protected route, or if all checks passed, render the children.
  return <>{children}</>;
}
