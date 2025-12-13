'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { updatePlan } from '@/lib/subscriptions';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  name: z.string().min(3, 'Plan name must be at least 3 characters.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.'),
  tier: z
    .enum(['Basic', 'Standard', 'Premium', 'Enterprise'])
    .default('Basic'),
  active: z.boolean().default(true),
  features: z
    .string()
    .min(10, 'Please list at least one feature.')
    .describe('Comma-separated list of features.'),
  projectsLimit: z.coerce.number().min(0, 'Limit must be 0 or more.'),
  seatsLimit: z.coerce.number().min(0, 'Limit must be 0 or more.'),
});

interface Plan {
  name: string;
  description: string;
  tier: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
  active: boolean;
  features: string[] | string;
  limits?: {
    projects: number;
    seats: number;
  };
}

export default function EditPlanPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const planId = params.planId as string;
  const [isLoading, setIsLoading] = useState(false);

  const { data: plan, loading: planLoading } = useDoc<Plan>(
    `plans/${planId}`
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      tier: 'Basic',
      active: true,
      features: '',
      projectsLimit: 0,
      seatsLimit: 0,
    },
  });

  useEffect(() => {
    if (plan) {
      const featuresString = Array.isArray(plan.features)
        ? plan.features.join(', ')
        : plan.features || '';
      form.reset({
        ...plan,
        features: featuresString,
        projectsLimit: plan.limits?.projects || 0,
        seatsLimit: plan.limits?.seats || 0,
      });
    }
  }, [plan, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await updatePlan(planId, values);
      toast({
        title: 'Plan Updated!',
        description: `Changes to "${values.name}" have been saved.`,
      });
      router.push('/dashboard/admin/subscriptions');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating plan:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to update plan. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (planLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
           <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-12 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Edit Subscription Plan</CardTitle>
            <CardDescription>
              Update the details for the "{plan?.name}" plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Premium Plus" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short summary of what this plan offers."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tier</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-full">
                    <div className="space-y-0.5">
                      <FormLabel>Active Plan</FormLabel>
                       <FormDescription>
                        Is this plan available for new subscriptions?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter comma-separated features. e.g., Feature One, Feature Two"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="projectsLimit"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Projects Limit</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="seatsLimit"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Team Seats Limit</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
