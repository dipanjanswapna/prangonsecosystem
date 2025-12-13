'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/firebase/auth/use-user';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, HeartHandshake, FileSearch } from 'lucide-react';
import { useMemo } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';

interface BloodRequest {
  id: string;
  patientName: string;
  status: 'pending' | 'fulfilled' | 'closed';
  createdAt: { seconds: number; nanoseconds: number };
  bloodGroup: string;
  location: string;
}

interface UserProfile {
    requestResponses?: string[];
}

const ResponseSkeleton = () => (
  <div className="flex justify-between items-center p-4 border rounded-lg">
    <div className="space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
    <div className="flex items-center gap-4">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-10 w-28" />
    </div>
  </div>
);

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'fulfilled':
      return 'secondary';
    case 'pending':
      return 'default';
    case 'closed':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function UserResponsesPage() {
  const { user } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(user ? `users/${user.uid}` : null);
  
  const requestIds = useMemo(() => userProfile?.requestResponses || [], [userProfile]);

  const { data: requests, loading: requestsLoading } = useCollection<BloodRequest>(
    'bloodRequests',
    undefined,
    undefined,
    undefined,
    undefined,
    requestIds.length > 0 ? [['__name__', 'in', requestIds]] : undefined
  );
  
  const loading = profileLoading || (requestIds.length > 0 && requestsLoading);

  const sortedRequests = useMemo(() => {
      if (!requests) return [];
      return [...requests].sort((a,b) => b.createdAt.seconds - a.createdAt.seconds);
  }, [requests])


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartHandshake className="h-6 w-6" />
            My Responses & Upcoming Donations
          </CardTitle>
          <CardDescription>
            Here are the blood requests you've responded to. Thank you for your willingness to help!
          </CardDescription>
        </CardHeader>
      </Card>
      
      {loading && (
         <div className="space-y-4">
            <ResponseSkeleton />
            <ResponseSkeleton />
            <ResponseSkeleton />
         </div>
      )}

      {!loading && sortedRequests.length === 0 && (
        <Card>
            <CardContent className="pt-6 text-center">
                <FileSearch className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">You haven't responded to any blood requests yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/blood-donation">Find a Request</Link>
                </Button>
            </CardContent>
        </Card>
      )}

      {!loading && sortedRequests.length > 0 && (
        <div className="space-y-4">
          {sortedRequests.map((request) => (
            <Card key={request.id}>
                <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <p className="font-semibold">Patient: {request.patientName} ({request.bloodGroup})</p>
                        <p className="text-sm text-muted-foreground">
                            Location: {request.location} | Requested on:{' '}
                            {new Date(
                                request.createdAt.seconds * 1000
                            ).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge
                        variant={getStatusVariant(request.status)}
                        className="capitalize text-sm"
                        >
                        {request.status}
                        </Badge>
                        <Button asChild variant="outline">
                            <Link href={`/blood-donation/requests/${request.id}`}>
                                View Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
