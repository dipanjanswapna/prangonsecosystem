'use client';

import { notFound, useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HandHeart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createSubscription } from '@/lib/subscriptions';
import { useUser } from '@/firebase/auth/use-user';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface Plan {
  id: string;
  name: string;
}

interface Price {
    id: string;
    planId: string;
    amount: number;
    currency: string;
    interval: 'month' | 'year' | 'lifetime';
}


function GatewayIcon({ name, src, isSelected, onClick }: { name: string; src: string; isSelected: boolean; onClick: () => void }) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all",
        isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"
      )}
      onClick={onClick}
    >
      <Image src={src} alt={name} width={60} height={40} className="object-contain rounded-md" />
    </div>
  );
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const priceId = searchParams.get('priceId');
  
  const { data: prices, loading: priceLoading } = useCollection<Price>('prices', undefined, undefined, undefined, undefined, priceId ? [['__name__', '==', priceId]] : undefined);
  const price = prices[0];
  
  const { data: plans, loading: planLoading } = useCollection<Plan>('plans', undefined, undefined, undefined, undefined, price?.planId ? [['__name__', '==', price.planId]] : undefined);
  const plan = plans[0];


  const [selectedGateway, setSelectedGateway] = useState<string | null>('bKash');
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
        setName(user.displayName || '');
        setEmail(user.email || '');
    }
  }, [user]);

  const loading = priceLoading || planLoading;

  if (loading) {
      return (
          <div className='max-w-4xl mx-auto'>
              <Card>
                  <CardHeader className='text-center'>
                      <Skeleton className='h-8 w-3/4 mx-auto' />
                      <Skeleton className='h-5 w-1/2 mx-auto mt-2' />
                  </CardHeader>
                  <CardContent className='space-y-8'>
                      <div className='space-y-4'>
                          <Skeleton className='h-6 w-1/3' />
                          <div className='grid grid-cols-2 gap-4'>
                               <Skeleton className='h-16 w-full' />
                               <Skeleton className='h-16 w-full' />
                          </div>
                      </div>
                      <div className='space-y-4'>
                          <Skeleton className='h-6 w-1/3' />
                           <div className='grid grid-cols-4 gap-4'>
                               <Skeleton className='h-16 w-full' />
                               <Skeleton className='h-16 w-full' />
                               <Skeleton className='h-16 w-full' />
                               <Skeleton className='h-16 w-full' />
                           </div>
                           <Skeleton className='h-14 w-full' />
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Skeleton className='h-12 w-full' />
                  </CardFooter>
              </Card>
          </div>
      )
  }

  if (!price || !plan) {
    notFound();
  }

  const gateways = [
      { name: "bKash", src: "https://i.ibb.co/609yv0N/bkash.png" },
      { name: "Nagad", src: "https://i.ibb.co/qMs2N1x/nagad.png" },
      { name: "Rocket", src: "https://i.ibb.co/mX1x12s/rocket.png" },
      { name: "SSLCommerz", src: "https://i.ibb.co/fCwH1s9/sslcommerz.png" },
      { name: "SurjoPay", src: "https://i.ibb.co/3s6K3h7/surjopay.png" },
  ];

  
  const handleProceedToPay = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Required', description: `Please log in to subscribe.` });
        router.push('/auth/login');
        return;
    }

     if (!selectedGateway) {
        toast({ variant: 'destructive', title: 'Payment Method Required', description: 'Please select a payment method.' });
        return;
     }

    setIsLoading(true);

    try {
      const subscriptionData = {
        userId: user.uid,
        planId: plan.id,
        priceId: price.id,
        status: 'pending' as const,
      };

      const newSubscriptionId = await createSubscription(subscriptionData);
      
      toast({ title: "Redirecting to payment...", description: "You will be redirected to complete your payment."});

      // TODO: Implement actual payment gateway redirection
      // For now, we will simulate a successful payment and redirect to the dashboard
      setTimeout(() => {
        setIsLoading(false);
        router.push('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error("Subscription initiation failed:", error);
      toast({
        variant: 'destructive',
        title: 'Subscription Failed',
        description: error.message || 'Could not start the subscription process. Please try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">
            Checkout
          </CardTitle>
          <CardDescription>
            You are subscribing to the <span className="font-bold text-primary">{plan.name}</span> plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="border rounded-lg p-6 space-y-3">
              <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">{plan.name} ({price.interval})</span>
                  <span className="font-bold">৳{price.amount.toLocaleString()}</span>
              </div>
              <Separator />
               <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span>৳{price.amount.toLocaleString()}</span>
              </div>
          </div>
          
          <div className="space-y-4">
            <Label className="text-lg font-medium">Your Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="name">Full Name</Label>
                 <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled />
               </div>
                <div className="space-y-2">
                 <Label htmlFor="email">Email Address</Label>
                 <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled/>
               </div>
            </div>
          </div>
          
          <div className="space-y-4">
             <Label className="text-lg font-medium">Select Payment Method</Label>
             <div className="grid grid-cols-3 md:grid-cols-5 gap-4 items-center justify-items-center rounded-lg bg-muted/50 p-4">
                {gateways.map(gateway => (
                    <GatewayIcon key={gateway.name} name={gateway.name} src={gateway.src} isSelected={selectedGateway === gateway.name} onClick={() => setSelectedGateway(gateway.name)} />
                ))}
             </div>
          </div>

        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full text-lg" onClick={handleProceedToPay} disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <HandHeart className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Processing...' : `Pay ৳${price.amount.toLocaleString()}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className='max-w-4xl mx-auto'><Skeleton className='h-[80vh] w-full'/></div>}>
            <CheckoutPageContent />
        </Suspense>
    )
}
