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
      // 1. Initial admin approval check
      if (userProfile.status !== 'approved') {
        if (pathname !== '/dashboard/access-denied') { // prevent redirect loop
          // You could create a specific page for this or just show the component
        }
        return;
      }
      
      const isPrivilegedRole = ![ROLES.USER, ROLES.ADMIN].includes(userProfile.role);

      // 2. Profile completion check for specific roles
      if (isPrivilegedRole && userProfile.profile_status === 'incomplete') {
        if (pathname !== '/auth/update-profile') {
          router.replace('/auth/update-profile');
        }
        return;
      }
      
      // 3. Final approval check after profile submission
       if (isPrivilegedRole && userProfile.profile_status === 'pending_review') {
         if (pathname !== '/dashboard/access-denied') {
            // You can show a specific "pending review" page here
         }
         return;
       }


      // 4. Role-based dashboard routing
      const userRole = userProfile.role || ROLES.USER;
      const expectedDashboardPath = `/dashboard/${userRole.toLowerCase()}`;
      
      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        router.replace(expectedDashboardPath);
        return;
      }
      
      const isDashboardPage = pathname.startsWith('/dashboard/');
      if (isDashboardPage && !pathname.startsWith(expectedDashboardPath)) {
        if(!(userRole === ROLES.ADMIN && pathname === '/dashboard/all-users')) {
           router.replace(expectedDashboardPath);
        }
      }
    }
  }, [user, userProfile, isLoading, router, pathname, isProtectedRoute]);

  const handleLogout = async () => {
    await logOut();
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
    if (userProfile.status !== 'approved') {
      return <AccessDenied status={userProfile.status} onLogout={handleLogout} />;
    }
     if (userProfile.profile_status === 'pending_review') {
        // A dedicated component for this state would be better.
        return <AccessDenied status="pending" onLogout={handleLogout} />;
    }
  }

  return <>{children}</>;
}
