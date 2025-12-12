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
import { Copy, Gift, Loader2, Droplets } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface UserProfile {
  referralCode?: string;
  name: string;
  phone?: string;
  bloodGroup?: string;
  totalDonations?: number;
  lastDonationDate?: { seconds: number, nanoseconds: number };
}

function ProfilePageContent() {
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const uidFromQuery = searchParams.get('uid');
  const { toast } = useToast();
  
  const profileId = uidFromQuery || user?.uid;

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(
    profileId ? `users/${profileId}` : null
  );
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const isOwnProfile = !uidFromQuery || uidFromQuery === user?.uid;


  useEffect(() => {
    if (!loading && !user && !uidFromQuery) {
      router.push('/auth/login');
    }
    if (userProfile) {
        setName(userProfile.name || '');
        setPhone(userProfile.phone || '');
        setBloodGroup(userProfile.bloodGroup || 'Not Set');
    }
  }, [user, loading, router, userProfile, uidFromQuery]);

  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register?ref=${userProfile?.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Link Copied!',
      description: 'Your referral link has been copied to the clipboard.',
    });
  };

  const handleSaveChanges = async () => {
    if (!user || !isOwnProfile) return;
    setIsSaving(true);
    try {
        const dataToUpdate: { name: string; phone?: string, bloodGroup?: string } = { name, phone };
        if (bloodGroup !== 'Not Set') {
            dataToUpdate.bloodGroup = bloodGroup;
        }
        await updateUserProfile(user.uid, dataToUpdate);
        toast({
            title: 'Profile Updated',
            description: 'Your changes have been saved successfully.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'Could not save your changes.',
        });
    } finally {
        setIsSaving(false);
    }
  }

  if (loading || profileLoading || !profileId) {
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
          {isOwnProfile ? "My Profile" : `${userProfile?.name}'s Profile`}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {isOwnProfile ? "Manage your account settings and profile information." : "Viewing public profile information."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Profile Information</CardTitle>
          <CardDescription>
             {isOwnProfile ? "Update your personal details here." : "Basic user information."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {userProfile?.photoURL ? (
                <AvatarImage src={userProfile.photoURL} alt={userProfile.name || 'User'} />
              ): (
                <AvatarFallback>
                  {(name || userProfile?.name)?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            {isOwnProfile && <Button variant="outline" disabled>Change Photo</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} readOnly={!isOwnProfile}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} readOnly disabled />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} readOnly={!isOwnProfile} />
            </div>
          </div>
          {isOwnProfile && <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Droplets className="h-6 w-6" />
                Blood Donation Information
            </CardTitle>
            <CardDescription>
              {isOwnProfile ? "Manage your blood donation details. This helps us find matches faster." : "Blood donation statistics."}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="blood-group">Blood Group</Label>
                    <Select value={bloodGroup} onValueChange={setBloodGroup} disabled={!isOwnProfile}>
                        <SelectTrigger id="blood-group">
                            <SelectValue placeholder="Select your blood group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Not Set">Not Set</SelectItem>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Total Donations</Label>
                    <Input readOnly disabled value={userProfile?.totalDonations || 0} />
                </div>
            </div>
            <div className='space-y-2'>
                <Label>Last Donation Date</Label>
                <Input readOnly disabled value={userProfile?.lastDonationDate ? format(new Date(userProfile.lastDonationDate.seconds * 1000), 'PPP') : 'N/A'} />
            </div>
            {isOwnProfile && <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Blood Group
            </Button>}
        </CardContent>
      </Card>
      
       {isOwnProfile && userProfile?.referralCode && (
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


export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading profile...</div>}>
            <ProfilePageContent />
        </Suspense>
    )
}
