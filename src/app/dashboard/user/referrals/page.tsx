'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUser } from '@/firebase/auth/use-user';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FileSearch, Gift, Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface ReferredUser {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: { seconds: number; nanoseconds: number };
}

interface UserProfile {
  referralCode?: string;
}

export default function UserReferralsPage() {
  const { user, loading: userLoading } = useUser();
  const { data: userProfileData, loading: profileLoading } = useCollection<UserProfile>(
    'users',
    'uid',
    user?.uid
  );
  
  const userProfile = userProfileData[0];

  const { data: referredUsers, loading: referralsLoading } = useCollection<ReferredUser>(
    'users',
    'referredBy',
    userProfile?.referralCode
  );

  const loading = userLoading || profileLoading || (userProfile?.referralCode ? referralsLoading : false);
  
  const [referralLink, setReferralLink] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    if (typeof window !== 'undefined' && userProfile?.referralCode) {
      setReferralLink(`${window.location.origin}/auth/register?ref=${userProfile.referralCode}`);
    }
  }, [userProfile]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Link Copied!',
      description: 'Your referral link has been copied to the clipboard.',
    });
  };

  const sortedReferredUsers = useMemo(() => {
    if (!referredUsers) return [];
    return [...referredUsers].sort((a,b) => b.createdAt.seconds - a.createdAt.seconds);
  }, [referredUsers]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            My Referrals
          </CardTitle>
          <CardDescription>
            Here is a list of all the users who have joined using your referral
            code. You earn 5 points for each successful referral!
          </CardDescription>
        </CardHeader>
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

      <Card>
         <CardHeader>
            <CardTitle>Referred Users</CardTitle>
             <CardDescription>
                A list of users who joined using your code.
            </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Email
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Joined On
                </TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-6 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : sortedReferredUsers.length > 0 ? (
                sortedReferredUsers.map((refUser) => (
                  <TableRow key={refUser.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={refUser.photoURL} />
                          <AvatarFallback>
                            {refUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{refUser.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {refUser.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(
                        refUser.createdAt.seconds * 1000
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">Joined</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : null}
            </TableBody>
          </Table>

           {!loading && sortedReferredUsers.length === 0 && (
             <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileSearch className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                No Referrals Yet
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                Share your referral link to start earning rewards!
                </p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
