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

const protectedRoutes = ['/dashboard', '/auth/profile', '/auth/update-profile'];

interface UserProfile {
  role: Role;
  status: 'pending' | 'approved' | 'rejected';
  profile_status: 'incomplete' | 'pending_review' | 'complete';
}

function AccessDenied({ status, onLogout }: { status: 'pending' | 'rejected', onLogout: () => void }) {
  const isPendingProfile = status === 'pending';
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-muted rounded-full p-3 w-fit">
            {isPendingProfile ? (
              <Clock className="h-10 w-10 text-primary" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-destructive" />
            )}
          </div>
          <CardTitle className="mt-4">
            {isPendingProfile ? 'Access Pending' : 'Access Denied'}
          </CardTitle>
          <CardDescription>
            {isPendingProfile
              ? 'Your account is currently awaiting admin approval. You will receive an email once your account has been reviewed. Thank you for your patience.'
              : 'Your registration was not approved. If you believe this is an error, please contact support.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <Button onClick={onLogout}>
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
    if (isLoading) return;

    if (!user) {
      if (isProtectedRoute) {
        router.replace('/auth/login');
      }
      return;
    }

    if (userProfile) {
      const { role, status, profile_status } = userProfile;
      const isPrivilegedRole = ![ROLES.USER, ROLES.ADMIN].includes(role);

      // Step 1: Check for incomplete profiles for privileged roles
      if (isPrivilegedRole && profile_status === 'incomplete') {
        if (pathname !== '/auth/update-profile') {
          router.replace('/auth/update-profile');
        }
        return; // Halt further checks until profile is complete
      }
      
      // Step 2: Check for overall account status or pending profile review
      if (status !== 'approved' || (isPrivilegedRole && profile_status === 'pending_review')) {
        // Let the component render the AccessDenied/Pending component
        return;
      }

      // Step 3: Role-based dashboard routing for approved users
      const userRole = role || ROLES.USER;
      const expectedDashboardPath = `/dashboard/${userRole.toLowerCase()}`;
      
      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        router.replace(expectedDashboardPath);
        return;
      }
      
      const isDashboardPage = pathname.startsWith('/dashboard/');
      if (isDashboardPage && !pathname.startsWith(expectedDashboardPath)) {
        // Allow admin to access certain pages outside their direct dashboard
        const allowedAdminPaths = ['/dashboard/all-users', '/dashboard/admin/donations'];
        if(!(userRole === ROLES.ADMIN && allowedAdminPaths.some(p => pathname.startsWith(p)))) {
           router.replace(expectedDashboardPath);
        }
      }
    }
  }, [user, userProfile, isLoading, router, pathname, isProtectedRoute]);

  const handleLogout = async () => {
    await logOut();
    router.push('/');
  };

  if (isLoading && isProtectedRoute) {
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

  if (isProtectedRoute && user && userProfile) {
    const isPrivilegedRole = ![ROLES.USER, ROLES.ADMIN].includes(userProfile.role);

    // Render AccessDenied or pending screens
    if (userProfile.status !== 'approved') {
      return <AccessDenied status={userProfile.status} onLogout={handleLogout} />;
    }
     if (isPrivilegedRole && userProfile.profile_status === 'pending_review') {
        return <AccessDenied status="pending" onLogout={handleLogout} />;
    }
  }

  return <>{children}</>;
}
