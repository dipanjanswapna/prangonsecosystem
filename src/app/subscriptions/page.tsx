'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  description: string;
  tier: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
  active: boolean;
  features: string[];
}

interface Price {
    id: string;
    planId: string;
    amount: number;
    currency: string;
    interval: 'month' | 'year' | 'lifetime';
    active: boolean;
}


function PlanSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
                 <Skeleton className="h-10 w-1/2" />
                 <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-5/6" />
                    <Skeleton className="h-5 w-full" />
                 </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-12 w-full" />
            </CardFooter>
        </Card>
    )
}

export default function SubscriptionsPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { data: plans, loading: plansLoading } = useCollection<Plan>('plans', undefined, undefined, undefined, undefined, [['active', '==', true]]);
  const { data: prices, loading: pricesLoading } = useCollection<Price>('prices', undefined, undefined, undefined, undefined, [['active', '==', true]]);

  const loading = plansLoading || pricesLoading;

  const plansWithPrices = useMemo(() => {
    return plans.map(plan => {
      const monthlyPrice = prices.find(p => p.planId === plan.id && p.interval === 'month');
      const yearlyPrice = prices.find(p => p.planId === plan.id && p.interval === 'year');
      return {
        ...plan,
        prices: {
          monthly: monthlyPrice,
          yearly: yearlyPrice,
        }
      };
    }).sort((a,b) => (a.prices.monthly?.amount || 0) - (b.prices.monthly?.amount || 0)); // Sort by monthly price
  }, [plans, prices]);


  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center px-4">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">
          Choose Your Plan
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock more features and support our work by subscribing to a plan that fits your needs.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Label htmlFor="billing-cycle" className={cn(billingCycle === 'monthly' ? 'text-primary' : 'text-muted-foreground', 'font-medium')}>
            Monthly
        </Label>
        <Switch 
            id="billing-cycle" 
            checked={billingCycle === 'yearly'} 
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            aria-label="Toggle billing cycle"
        />
        <Label htmlFor="billing-cycle" className={cn(billingCycle === 'yearly' ? 'text-primary' : 'text-muted-foreground', 'font-medium')}>
            Yearly
        </Label>
        <div className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-2.5 py-1 rounded-full">
            Save 20%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {loading ? (
             Array.from({ length: 3 }).map((_, i) => <PlanSkeleton key={i} />)
        ) : (
            plansWithPrices.map((plan) => {
                const isPopular = plan.tier === 'Standard';
                const price = billingCycle === 'monthly' 
                    ? plan.prices.monthly 
                    : plan.prices.yearly;
                
                const displayPrice = price?.amount ?? (billingCycle === 'monthly' ? 19 : 190);
                const hasPrice = price !== undefined;

                return (
                    <Card key={plan.id} className={cn("flex flex-col", isPopular && "border-primary border-2 shadow-primary/20 shadow-lg")}>
                        <CardHeader>
                            {isPopular && <div className="text-center mb-2"><span className="text-xs font-bold uppercase text-primary tracking-wider">Most Popular</span></div>}
                            <CardTitle className="font-headline text-3xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-6">
                            <div>
                                <span className="text-4xl font-extrabold">৳{displayPrice.toLocaleString()}</span>
                                <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                            </div>
                            <ul className="space-y-3 text-sm">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button size="lg" className="w-full" variant={isPopular ? 'default' : 'outline'} disabled={!hasPrice} asChild>
                                <Link href={hasPrice ? `/subscriptions/checkout?priceId=${price.id}` : '#'}>
                                    {hasPrice ? `Choose ${plan.name}`: 'Coming Soon'}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })
        )}
      </div>
    </div>
  );
}
