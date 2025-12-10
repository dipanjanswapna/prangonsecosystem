'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase/auth/use-user';
import { Copy, Gift, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  referralCode?: string;
}


export default function ProfilePage() {
  const { user, loading } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(
    user ? `users/${user.uid}` : null
  );
  const router = useRouter();
  const { toast } = useToast();

  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register?ref=${userProfile?.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Link Copied!',
      description: 'Your referral link has been copied to the clipboard.',
    });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || profileLoading || !user) {
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
      
       {userProfile?.referralCode && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Gift className="h-6 w-6" />
                Referral Information
            </CardTitle>
            <CardDescription>
              Invite friends to earn rewards. Share your unique link below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Your Referral Code</Label>
              <p className="font-mono text-lg font-semibold bg-muted px-3 py-2 rounded-md">{userProfile.referralCode}</p>
            </div>
            <div>
              <Label>Your Referral Link</Label>
              <div className="flex gap-2">
                <Input readOnly value={referralLink} className="bg-muted/50" />
                <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copy referral link">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
