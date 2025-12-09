'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase/auth/use-user';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-60 mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-10 w-28" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          My Profile
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage your account settings and profile information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Profile Information</CardTitle>
          <CardDescription>
            Update your personal details here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {user.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
              ): (
                <AvatarFallback>
                  {(user.displayName || user.email)?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <Button variant="outline">Change Photo</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user.displayName || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email || ''} readOnly />
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
