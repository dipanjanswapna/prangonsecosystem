'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/firebase/auth/use-user';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight, Package } from 'lucide-react';

interface Donation {
  id: string;
  campaignTitle: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  createdAt: { seconds: number; nanoseconds: number };
}

const DonationSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-5 w-1/4" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-28" />
    </CardFooter>
  </Card>
);

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'success':
      return 'secondary';
    case 'pending':
      return 'default';
    case 'failed':
    case 'refunded':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function UserContributionsPage() {
  const { user } = useUser();
  const { data: donations, loading } = useCollection<Donation>(
    'donations',
    'userId',
    user?.uid
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            My Contributions
          </CardTitle>
          <CardDescription>
            Here is a list of all your monetary donations. Thank you for your generosity!
          </CardDescription>
        </CardHeader>
      </Card>
      
      {loading && (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DonationSkeleton />
            <DonationSkeleton />
            <DonationSkeleton />
         </div>
      )}

      {!loading && donations.length === 0 && (
        <Card>
            <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">You haven't made any donations yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/donations">Explore Campaigns</Link>
                </Button>
            </CardContent>
        </Card>
      )}

      {!loading && donations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <Card key={donation.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{donation.campaignTitle}</CardTitle>
                <CardDescription>
                  Donated on:{' '}
                  {new Date(
                    donation.createdAt.seconds * 1000
                  ).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex justify-between items-center">
                <div className="text-2xl font-bold">
                  ৳{donation.amount.toFixed(2)}
                </div>
                <Badge
                  variant={getStatusVariant(donation.status)}
                  className="capitalize"
                >
                  {donation.status}
                </Badge>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/donations/invoice/${donation.id}`}>
                    View Invoice <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
