
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams, notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';
import { confirmSubscription } from '@/lib/subscriptions';

interface Subscription {
    id: string;
    planId: string;
    planName?: string;
    priceId: string;
    status: 'pending' | 'active' | 'canceled';
}

function ConfirmationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);

  const subscriptionId = searchParams.get('subscriptionId');

  const { data: subscription, loading: subscriptionLoading } = useDoc<Subscription>(
    user && subscriptionId ? `users/${user.uid}/subscriptions/${subscriptionId}`: null
  );

  const loading = userLoading || subscriptionLoading;

  const handleConfirmPayment = async () => {
    if (!user || !subscription) {
      toast({ variant: 'destructive', title: 'Error', description: 'Subscription details not found.' });
      return;
    }
    setIsConfirming(true);
    try {
        await confirmSubscription(user.uid, subscription.id, subscription.planId);
        toast({ title: 'Subscription Activated!', description: `Your ${subscription.planName} plan is now active.` });
        router.push('/dashboard/user/subscriptions');
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Confirmation Failed', description: error.message || 'Could not activate your subscription.'});
        setIsConfirming(false);
    }
  };
  
  if (loading) {
    return (
        <Card className="max-w-lg mx-auto">
            <CardHeader className="items-center text-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-8 w-48 mt-4" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full" />
            </CardContent>
             <CardFooter>
                <Skeleton className="h-12 w-full" />
            </CardFooter>
        </Card>
    )
  }
  
  if (subscription === null) {
    notFound();
  }

  if (subscription && subscription.status !== 'pending') {
    return (
        <Card className="max-w-lg mx-auto">
            <CardHeader className="items-center text-center">
                 <CheckCircle className="h-12 w-12 text-green-500" />
                 <CardTitle className="mt-4">Already Activated</CardTitle>
                 <CardDescription>
                     This subscription is already active.
                 </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button className="w-full" onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="items-center text-center">
        <CardTitle className="font-headline text-2xl">Confirm Your Subscription</CardTitle>
        <CardDescription>
          You are about to activate the <span className="font-bold text-primary">{subscription?.planName}</span> plan. Click below to complete the process.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">This is a demo payment system. No real money will be charged.</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleConfirmPayment} disabled={isConfirming} className="w-full" size="lg">
          {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm & Activate
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ConfirmSubscriptionPage() {
    return (
        <Suspense fallback={<p>Loading confirmation...</p>}>
            <ConfirmationPageContent />
        </Suspense>
    )
}
