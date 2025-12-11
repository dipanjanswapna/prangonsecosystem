'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection } from '@/firebase/firestore/use-collection';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Droplets, PlusCircle, Hospital, User } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  reason: string;
  quantity: number;
  hospitalName: string;
  location: string;
  status: 'pending' | 'fulfilled' | 'closed';
  neededBy: { seconds: number; nanoseconds: number };
  createdAt: { seconds: number; nanoseconds: number };
}

const bloodGroupStyles: { [key: string]: string } = {
    'A+': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
    'A-': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
    'B+': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
    'B-': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
    'AB+': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
    'AB-': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
    'O+': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
    'O-': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
};


const RequestCardSkeleton = () => (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-6 w-3/4 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
)

export default function BloodDonationPage() {
  const { data, loading } = useCollection<BloodRequest>(
    'bloodRequests',
    undefined,
    undefined,
    undefined,
    undefined,
    [['status', '==', 'pending']]
  );

  const requests = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  }, [data]);

  return (
    <div className="space-y-12">
      <section className="text-center bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 p-8 md:p-12 rounded-2xl">
        <Droplets className="mx-auto h-16 w-16 text-primary" />
        <h1 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight mt-4">
          Become a Lifesaver Today
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Your single blood donation can save up to three lives. Join our community of heroes and make a real impact. Find requests near you or submit one for someone in need.
        </p>
        <Button asChild size="lg" className="mt-8">
            <Link href="/blood-donation/request">
                <PlusCircle className="mr-2 h-5 w-5" />
                Request Blood
            </Link>
        </Button>
      </section>

      <section>
        <h2 className="font-headline text-2xl md:text-3xl font-bold mb-6 text-center">Active Blood Requests</h2>
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <RequestCardSkeleton key={i} />)}
            </div>
        ) : requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(req => (
                <Card key={req.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <div className={cn("flex items-center justify-center h-16 w-16 rounded-full font-bold text-2xl border-4", bloodGroupStyles[req.bloodGroup] || '')}>
                                {req.bloodGroup}
                            </div>
                           <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(req.createdAt.seconds * 1000), { addSuffix: true })}</p>
                        </div>
                        <CardTitle className="pt-2">Need {req.quantity} bag(s) of {req.bloodGroup} blood</CardTitle>
                        <CardDescription>For: {req.patientName}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3 text-sm">
                        <div className="flex items-start gap-3 text-muted-foreground">
                            <Hospital className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{req.hospitalName}, {req.location}</span>
                        </div>
                         <div className="flex items-start gap-3 text-muted-foreground">
                            <User className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>Needed by {new Date(req.neededBy.seconds * 1000).toLocaleDateString()}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href={`/blood-donation/requests/${req.id}`}>
                                View Details & Respond <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
        ) : (
             <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold">No Active Requests</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    There are no pending blood requests at the moment.
                </p>
            </div>
        )}
      </section>
    </div>
  );
}
