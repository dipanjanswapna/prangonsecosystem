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
import { Users, FileSearch } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

interface ReferredUser {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export default function UserReferralsPage() {
  const { user } = useUser();
  const { data: userProfile } = useCollection<any>('users', 'uid', user?.uid);

  const referralCode = useMemo(() => {
    return userProfile.length > 0 ? userProfile[0].referralCode : null;
  }, [userProfile]);

  const { data: referredUsers, loading } = useCollection<ReferredUser>(
    'users',
    'referredBy',
    referralCode
  );
  
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
            code. You earn 50 points for each successful referral!
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
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
