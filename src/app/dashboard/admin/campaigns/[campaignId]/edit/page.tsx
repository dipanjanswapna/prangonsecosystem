'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
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
import { updateCampaign } from '@/lib/campaigns';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  shortDescription: z
    .string()
    .min(20, 'Short description must be at least 20 characters.')
    .max(160, 'Short description cannot exceed 160 characters.'),
  description: z
    .string()
    .min(50, 'Full description must be at least 50 characters.'),
  goal: z.coerce.number().min(1000, 'Goal must be at least ৳1000.'),
  category: z.enum(['Seasonal', 'Emergency', 'Regular']).default('Regular'),
  imageUrl: z.string().url('Please enter a valid image URL.'),
  voteOptions: z
    .string()
    .optional()
    .describe('Comma-separated list of voting options for the campaign.'),
  telegramLink: z
    .string()
    .url('Please enter a valid URL.')
    .optional()
    .or(z.literal('')),
});


interface Campaign {
  title: string;
  shortDescription: string;
  description: string;
  goal: number;
  category: 'Seasonal' | 'Emergency' | 'Regular';
  imageUrl: string;
  voteOptions?: string[] | string;
  telegramLink?: string;
}

export default function EditCampaignPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId as string;
  const [isLoading, setIsLoading] = useState(false);

  const { data: campaign, loading: campaignLoading } = useDoc<Campaign>(
    `campaigns/${campaignId}`
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      shortDescription: '',
      description: '',
      goal: 10000,
      category: 'Regular',
      imageUrl: '',
      voteOptions: '',
      telegramLink: '',
    },
  });

  useEffect(() => {
    if (campaign) {
      const voteOptionsString = Array.isArray(campaign.voteOptions)
        ? campaign.voteOptions.join(', ')
        : campaign.voteOptions || '';
      form.reset({
        ...campaign,
        voteOptions: voteOptionsString,
      });
    }
  }, [campaign, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await updateCampaign(campaignId, values);
      toast({
        title: 'Campaign Updated!',
        description: `Changes to "${values.title}" have been saved.`,
      });
      router.push('/dashboard/admin/campaigns');
      router.refresh();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to update campaign. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (campaignLoading) {
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
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
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
            <CardTitle>Edit Campaign</CardTitle>
            <CardDescription>
              Update the details for the campaign "{campaign?.title}".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Winter Clothing Drive for the Underprivileged"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief, one-sentence summary for the campaign list page."
                      {...field}
                    />
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
                  <FormLabel>Full Description (About this campaign)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the campaign's purpose, goals, and how the funds will be used. You can use line breaks for paragraphs."
                      {...field}
                      rows={8}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fundraising Goal (BDT)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Seasonal">Seasonal</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="voteOptions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voting Options</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Blankets, Food, Medicine"
                      {...field}
                    />
                  </FormControl>
                  <CardDescription>
                    Optional. Enter comma-separated values for users to vote
                    on.
                  </CardDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telegramLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram Proof Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://t.me/your_channel_or_group"
                      {...field}
                    />
                  </FormControl>
                  <CardDescription>
                    Optional. Link to a Telegram channel/group for showing
                    proof.
                  </CardDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
