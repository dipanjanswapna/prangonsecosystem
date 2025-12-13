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
import { ArrowRight, Ticket, CircleSlash } from 'lucide-react';
import { useMemo } from 'react';

interface Subscription {
  id: string;
  planId: string;
  planName?: string;
  priceId: string;
  status: 'pending' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
  currentPeriodEnd: { seconds: number; nanoseconds: number };
}

const SubscriptionSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-5 w-1/4" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'secondary';
    case 'pending':
      return 'default';
    case 'past_due':
    case 'canceled':
    case 'expired':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function UserSubscriptionsPage() {
  const { user } = useUser();
  const { data: subscriptions, loading } = useCollection<Subscription>(
    user ? `users/${user.uid}/subscriptions` : ''
  );

  const sortedSubscriptions = useMemo(() => {
    if (!subscriptions) return [];
    return [...subscriptions].sort(
      (a, b) => b.currentPeriodEnd.seconds - a.currentPeriodEnd.seconds
    );
  }, [subscriptions]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            My Subscriptions
          </CardTitle>
          <CardDescription>
            Here is a list of your current and past subscriptions.
          </CardDescription>
        </CardHeader>
      </Card>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SubscriptionSkeleton />
          <SubscriptionSkeleton />
        </div>
      )}

      {!loading && sortedSubscriptions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
             <CircleSlash className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              You do not have any active subscriptions.
            </p>
            <Button asChild className="mt-4">
              <Link href="/subscriptions">Explore Plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && sortedSubscriptions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSubscriptions.map((sub) => (
            <Card key={sub.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{sub.planName || sub.planId}</CardTitle>
                <CardDescription>
                  Status:{' '}
                   <Badge
                    variant={getStatusVariant(sub.status)}
                    className="capitalize"
                  >
                    {sub.status}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  {sub.status === 'active' ? 'Renews on:' : 'Expires on:'}
                  <span className="font-semibold text-foreground">
                    {' '}
                    {new Date(
                      sub.currentPeriodEnd.seconds * 1000
                    ).toLocaleDateString()}
                  </span>
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/subscriptions/manage/${sub.id}`}>
                    Manage Subscription <ArrowRight className="ml-2 h-4 w-4" />
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
