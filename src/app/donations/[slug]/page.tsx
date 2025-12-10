'use client';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift, HandHeart, QrCode } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import type { Timestamp } from 'firebase/firestore';
import { CampaignUsageReport } from './usage-report';
import { VoteCard } from './vote-card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  goal: number;
  raised: number;
  imageUrl: string;
  voteOptions?: string[];
}

interface Donation {
  id: string;
  donorName: string;
  amount: number;
  createdAt: Timestamp;
}


const CampaignDetailsSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-full mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className='space-y-2'>
                            <div className="flex justify-between">
                                <Skeleton className="h-8 w-1/4" />
                                <Skeleton className="h-6 w-1/4" />
                            </div>
                            <Skeleton className="h-3 w-full" />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="h-12 w-40" />
                            <Skeleton className="h-12 w-40" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
)


export default function CampaignDetailsPage() {
  const params = useParams<{ slug: string }>();
  const { data: campaigns, loading } = useCollection<Campaign>(
    'campaigns',
    'slug',
    params.slug
  );
  const campaign = campaigns[0];
  const { data: donations, loading: donationsLoading } = useCollection<Donation>(
    'donations',
    undefined,
    undefined,
    undefined, 
    5,
    [
      ['campaignId', '==', campaign?.id || ''],
      ['status', '==', 'success'],
      ['isAnonymous', '==', false]
    ]
  );
  
  if (loading) {
    return <CampaignDetailsSkeleton />;
  }

  if (!campaign) {
    notFound();
  }

  const progress = (campaign.raised / campaign.goal) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="aspect-video relative bg-muted">
              <Image
                src={campaign.imageUrl}
                alt={campaign.title}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-3xl md:text-4xl">
                {campaign.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {campaign.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-muted-foreground">
                      <span className="font-bold text-2xl text-foreground">
                        ৳{campaign.raised.toLocaleString()}
                      </span>{' '}
                      raised
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        ৳{campaign.goal.toLocaleString()}
                      </span>{' '}
                      goal
                    </div>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="text-right text-sm mt-1 text-muted-foreground">
                    {progress.toFixed(0)}% funded
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={`/donations/${campaign.slug}/donate`}>
                        Donate Now <HandHeart className="ml-2 h-5 w-5" />
                    </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                        <Link href={`/donations/qr/${campaign.slug}`}>
                            Scan QR Code <QrCode className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About this campaign</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-full">
              <p>
                This campaign aims to address the critical need for warm clothing in remote villages during the winter season. Many families lack adequate protection against the cold, leading to health issues and hardship.
              </p>
              <p>
                Your donation will directly fund the purchase and distribution of high-quality blankets, jackets, and other winter essentials. We partner with local volunteers to ensure the aid reaches the most vulnerable individuals, including children and the elderly.
              </p>
              <h4>How Your Donation Helps:</h4>
              <ul>
                <li><strong>৳1000</strong> can provide a warm blanket for one person.</li>
                <li><strong>৳2500</strong> can supply a family with a winter kit.</li>
                <li><strong>৳10000</strong> can help us reach four families in need.</li>
              </ul>
            </CardContent>
          </Card>
          <CampaignUsageReport campaignId={campaign.id} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Recent Donors
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-96">
              <CardContent className="space-y-4">
                {donationsLoading ? (
                   Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-grow space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                          </div>
                      </div>
                  ))
                ) : donations.length > 0 ? (
                  donations.map((donor) => (
                  <div key={donor.id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{donor.donorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="font-semibold">{donor.donorName}</p>
                      <p className="text-sm text-muted-foreground">
                        Donated ৳{donor.amount}
                      </p>
                    </div>
                     <Badge variant="secondary">
                      {new Date(donor.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Badge>
                  </div>
                ))) : (
                  <p className="text-sm text-muted-foreground">Be the first to donate to this campaign!</p>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
          {campaign.voteOptions && campaign.voteOptions.length > 0 && (
            <VoteCard campaignId={campaign.id} voteOptions={campaign.voteOptions} />
          )}
        </div>
      </div>
    </div>
  );
}
