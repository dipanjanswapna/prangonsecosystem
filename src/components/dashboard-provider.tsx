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
            <Button onClick={() => logOut().then(() => router.push('/'))}>
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

  useEffect(() => {
    const isProtected = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );
    if (!isProtected || isLoading) {
      return;
    }

    if (!user) {
      router.push('/auth/login?redirect=' + pathname);
      return;
    }
    
    if (userProfile?.status && userProfile.status !== 'approved') {
        // The AccessDenied component will be shown, so no need to redirect.
        return;
    }

    if (userProfile) {
      const userRole = userProfile.role || ROLES.USER;
      const expectedDashboardPath = `/dashboard/${userRole.toLowerCase()}`;

      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        router.replace(expectedDashboardPath);
      }
    }
  }, [user, userProfile, isLoading, router, pathname]);

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isLoading && isProtected) {
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

  if (isProtected && user && userProfile && userProfile.status !== 'approved') {
    return <AccessDenied status={userProfile.status} />;
  }
  
  return <>{children}</>;
}
