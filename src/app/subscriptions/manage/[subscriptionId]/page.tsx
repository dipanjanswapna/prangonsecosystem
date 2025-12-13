'use client';

import { Suspense } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Timestamp } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cancelSubscription } from '@/lib/subscriptions';
import { ArrowLeft, Calendar, ShieldX, Ticket, Info } from 'lucide-react';
import Link from 'next/link';

interface Subscription {
  id: string;
  planId: string;
  planName?: string;
  priceId: string;
  status:
    | 'pending'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'expired';
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Timestamp;
}

function SubscriptionManagementSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
      <CardFooter className="gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );
}

function getStatusVariant(status: string) {
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
}

function SubscriptionManagePageContent() {
  const params = useParams();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const subscriptionId = params.subscriptionId as string;

  const { data: subscription, loading: subscriptionLoading } =
    useDoc<Subscription>(
      user?.uid && subscriptionId
        ? `users/${user.uid}/subscriptions/${subscriptionId}`
        : null
    );

  const loading = userLoading || subscriptionLoading;

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;
    try {
      await cancelSubscription(user.uid, subscription.id, 'User requested cancellation');
      toast({
        title: 'Subscription Cancelled',
        description:
          'Your subscription has been successfully cancelled. You will retain access until the end of the current period.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Cancellation Failed',
        description:
          error.message || 'Could not cancel your subscription. Please try again.',
      });
    }
  };

  if (loading) {
    return <SubscriptionManagementSkeleton />;
  }

  if (!subscription) {
    notFound();
  }

  const isCancelled = subscription.status === 'canceled' || subscription.cancelAtPeriodEnd;

  return (
    <div className="space-y-6">
       <Button variant="outline" asChild>
          <Link href="/dashboard/user/subscriptions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Subscriptions
          </Link>
       </Button>
        <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Ticket /> Manage Subscription
                </CardTitle>
                <CardDescription>
                View details and manage your '{subscription.planName}' plan.
                </CardDescription>
            </div>
            <Badge
                variant={getStatusVariant(subscription.status)}
                className="capitalize text-base"
            >
                {subscription.status}
            </Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-semibold">{subscription.planName}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                     <span className="font-semibold capitalize">{subscription.status}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{isCancelled ? 'Access Expires On' : 'Renews On'}</span>
                    <span className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(
                        subscription.currentPeriodEnd.seconds * 1000
                        ).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {isCancelled && (
                <div className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg flex items-start gap-3">
                    <Info className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold">Your subscription is set to be cancelled.</p>
                        <p className="text-sm">You will continue to have access to all features until the end of the current billing period.</p>
                    </div>
                </div>
            )}
            
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2">
            {!isCancelled && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <ShieldX className="mr-2 h-4 w-4" />
                            Cancel Subscription
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will cancel your subscription at the end of the current billing period. You can re-subscribe anytime.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive hover:bg-destructive/90">
                            Yes, Cancel
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Button variant="outline">Contact Support</Button>
        </CardFooter>
        </Card>
    </div>
  );
}


export default function SubscriptionManagePage() {
    return (
        <Suspense fallback={<SubscriptionManagementSkeleton />}>
            <SubscriptionManagePageContent />
        </Suspense>
    )
}
