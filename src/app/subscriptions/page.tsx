'use client';

import { useState } from 'react';
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

interface Plan {
  id: string;
  name: string;
  description: string;
  tier: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
  active: boolean;
  features: string[];
  // Assuming monthly and yearly prices would be stored in a separate 'prices' collection
  // For now, we'll use placeholder prices.
}

const placeholderPrices: { [key: string]: { monthly: number; yearly: number } } = {
    'Basic': { monthly: 9, yearly: 90 },
    'Standard': { monthly: 19, yearly: 190 },
    'Premium': { monthly: 49, yearly: 490 },
    'Enterprise': { monthly: 99, yearly: 990 },
};

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
  const { data: plans, loading } = useCollection<Plan>('plans', undefined, undefined, undefined, undefined, [['active', '==', true]]);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
             Array.from({ length: 3 }).map((_, i) => <PlanSkeleton key={i} />)
        ) : (
            plans.map((plan) => {
                const isPopular = plan.tier === 'Standard';
                const prices = placeholderPrices[plan.tier] || { monthly: 0, yearly: 0 };
                const displayPrice = billingCycle === 'monthly' ? prices.monthly : prices.yearly;

                return (
                    <Card key={plan.id} className={cn("flex flex-col", isPopular && "border-primary border-2 shadow-primary/20 shadow-lg")}>
                        <CardHeader>
                            {isPopular && <div className="text-center mb-2"><span className="text-xs font-bold uppercase text-primary tracking-wider">Most Popular</span></div>}
                            <CardTitle className="font-headline text-3xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-6">
                            <div>
                                <span className="text-4xl font-extrabold">৳{displayPrice}</span>
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
                            <Button size="lg" className="w-full" variant={isPopular ? 'default' : 'outline'}>
                                Choose {plan.name}
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
