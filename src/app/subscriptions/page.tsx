
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CheckCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const plans = [
    {
        tier: 'Basic',
        popular: false,
        monthlyPrice: 9,
        yearlyPrice: 90,
        description: 'Get started with our essential features.',
        features: [
            'Access to all free content',
            'Basic AI Tool usage',
            'Community forum access',
            'Email support',
        ]
    },
    {
        tier: 'Standard',
        popular: true,
        monthlyPrice: 19,
        yearlyPrice: 190,
        description: 'Unlock more features and increase your limits.',
        features: [
            'Everything in Basic',
            'Extended AI Tool usage',
            'Access to premium articles',
            'Priority email support',
        ]
    },
    {
        tier: 'Premium',
        popular: false,
        monthlyPrice: 49,
        yearlyPrice: 490,
        description: 'Get the full experience with all features unlocked.',
        features: [
            'Everything in Standard',
            'Unlimited AI Tool usage',
            'Access to all eBooks',
            '1-on-1 mentorship session (1/year)',
        ]
    }
]

export default function SubscriptionsPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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
        {plans.map((plan) => (
            <Card key={plan.tier} className={cn("flex flex-col", plan.popular && "border-primary border-2 shadow-primary/20 shadow-lg")}>
                <CardHeader>
                    {plan.popular && <div className="text-center mb-2"><span className="text-xs font-bold uppercase text-primary tracking-wider">Most Popular</span></div>}
                    <CardTitle className="font-headline text-3xl">{plan.tier}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-6">
                    <div>
                        <span className="text-4xl font-extrabold">৳{billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}</span>
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
                    <Button size="lg" className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        Choose {plan.tier}
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}

    