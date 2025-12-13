'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  BadgeCheck,
  Calendar,
  ChevronLeft,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
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
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cancelSubscription } from '@/lib/subscriptions';
import { Label } from '@/components/ui/label';

interface Subscription {
  id: string;
  planId: string;
  planName: string;
  priceId: string;
  status:
    | 'pending'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'expired';
  currentPeriodEnd: { seconds: number; nanoseconds: number };
  currentPeriodStart: { seconds: number; nanoseconds: number };
  cancelAtPeriodEnd: boolean;
  canceledAt?: { seconds: number; nanoseconds: number };
}

function SubscriptionManagementSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </CardContent>
      <CardFooter className="gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );
}

export default function SubscriptionManagePage() {
  const params = useParams();
  const subscriptionId = params.subscriptionId as string;
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const { data: subscription, loading: subscriptionLoading } =
    useDoc<Subscription>(user ? `users/${user.uid}/subscriptions/${subscriptionId}` : null);
  
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const handleCancelSubscription = async () => {
      if (!user || !subscription) return;
      setIsCanceling(true);
      try {
          await cancelSubscription(user.uid, subscription.id, cancellationReason);
          toast({
              title: 'Subscription Canceled',
              description: 'Your subscription has been successfully canceled.',
          });
          // The page will auto-refresh due to useDoc hook
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: 'Cancellation Failed',
              description: error.message || 'Could not cancel your subscription. Please try again.'
          })
      } finally {
          setIsCanceling(false);
      }
  };


  const loading = userLoading || subscriptionLoading;

  if (loading) {
    return <SubscriptionManagementSkeleton />;
  }

  if (!subscription) {
    notFound();
  }

  const isCanceled = subscription.status === 'canceled';
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="mb-4">
             <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/user/subscriptions">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Subscriptions
                </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-headline">
              Manage Subscription
            </CardTitle>
            <Badge variant={isActive ? 'secondary' : 'destructive'} className="capitalize">
              {subscription.status}
            </Badge>
          </div>
          <CardDescription>
            View details and manage your "{subscription.planName}" plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 border rounded-lg bg-muted/50 space-y-4">
             <div className="flex justify-between items-center">
                 <p className="font-semibold text-lg">{subscription.planName}</p>
                 <p className="text-sm text-muted-foreground">ID: {subscription.id}</p>
             </div>
             <Separator />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="flex items-center gap-2">
                     <Calendar className="h-5 w-5 text-muted-foreground" />
                     <div>
                         <p className="text-xs text-muted-foreground">Subscribed On</p>
                         <p className="font-medium">{new Date(subscription.currentPeriodStart.seconds * 1000).toLocaleDateString()}</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <RefreshCw className="h-5 w-5 text-muted-foreground" />
                     <div>
                         <p className="text-xs text-muted-foreground">{isActive ? 'Next Billing Date' : 'Expired On'}</p>
                         <p className="font-medium">{new Date(subscription.currentPeriodEnd.seconds * 1000).toLocaleDateString()}</p>
                     </div>
                 </div>
             </div>
          </div>
          {isCanceled && subscription.canceledAt && (
             <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded-r-lg">
                <p className="text-sm text-destructive-foreground">This subscription was canceled on {new Date(subscription.canceledAt.seconds * 1000).toLocaleDateString()}.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-4">
            <Button variant="outline" disabled={isCanceled}>Change Plan</Button>
            
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isCanceled}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Subscription
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will cancel your subscription immediately. You will lose access to premium features at the end of your current billing period.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="cancellation-reason">Reason for cancellation (optional)</Label>
                        <Textarea 
                            id="cancellation-reason" 
                            placeholder="We'd love to hear your feedback..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription} disabled={isCanceling}>
                            {isCanceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Yes, Cancel
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </CardFooter>
      </Card>
    </div>
  );
}
