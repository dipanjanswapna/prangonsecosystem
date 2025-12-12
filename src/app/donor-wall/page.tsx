
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Gift, HandHeart } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';
import { useMemo } from 'react';

interface Donation {
  id: string;
  donorName: string;
  campaignTitle: string;
  amount: number;
  createdAt: Timestamp;
  isAnonymous: boolean;
  status: 'pending' | 'success' | 'failed' | 'refunded';
}

function DonationCardSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row gap-4 items-center pb-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-grow space-y-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow pt-2">
                 <Skeleton className="h-5 w-1/3" />
            </CardContent>
        </Card>
    )
}

export default function DonorWallPage() {
  const { data: donations, loading } = useCollection<Donation>(
    'donations',
    undefined,
    undefined,
    { field: 'createdAt', direction: 'desc' },
    50 // Fetch recent donations
  );
  
  const publicDonations = useMemo(() => {
    return donations.filter(d => d.status === 'success' && !d.isAnonymous).slice(0, 20);
  }, [donations]);
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <HandHeart className="mx-auto h-16 w-16 text-primary" />
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mt-4">
          Wall of Generosity
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          We celebrate and thank our incredible community of donors who make our work possible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
             Array.from({ length: 12 }).map((_, i) => <DonationCardSkeleton key={i} />)
        ) : (
            publicDonations.map(donation => (
                <Card key={donation.id} className="flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                             <div className="p-2 bg-primary/10 rounded-full">
                                <Gift className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{donation.donorName}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <p className="text-3xl font-bold">৳{donation.amount.toLocaleString()}</p>
                        <CardDescription>
                            Contributed to <span className="font-medium text-foreground">{donation.campaignTitle}</span>
                        </CardDescription>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
       {!loading && publicDonations.length === 0 && (
         <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No public donations have been made recently. Be the first to appear on our Wall of Generosity!</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
