'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, ShoppingCart, Leaf, Siren } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';

interface Campaign {
    id: string;
    title: string;
    slug: string;
    description: string;
    goal: number;
    raised: number;
    imageId: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    category?: 'Seasonal' | 'Emergency' | 'Regular';
}

const categoryStyles = {
    Seasonal: {
      icon: Leaf,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-700/50',
    },
    Emergency: {
      icon: Siren,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-700/50',
    },
};

const CampaignCategoryBadge = ({ category }: { category?: 'Seasonal' | 'Emergency' | 'Regular' }) => {
    if (!category || category === 'Regular') return null;

    const Icon = categoryStyles[category]?.icon;
    const styles = categoryStyles[category];

    if (!Icon || !styles) return null;

    return (
        <Badge
        variant="outline"
        className={cn(
            "absolute top-4 left-4 z-10 font-semibold",
            styles.bgColor,
            styles.textColor,
            styles.borderColor
        )}
        >
        <Icon className="mr-1.5 h-3.5 w-3.5" />
        {category}
        </Badge>
    );
};

const CampaignCardSkeleton = () => (
    <Card className="flex flex-col overflow-hidden">
        <div className="aspect-video bg-muted animate-pulse"></div>
        <CardHeader>
            <div className="flex justify-between items-start gap-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-5 mt-1" />
            </div>
            <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <Skeleton className="h-2 w-full" />
            <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
            </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
)

export default function DonationsPage() {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const router = useRouter();
  const { data: campaigns, loading } = useCollection<Campaign>('campaigns', 'status', 'active');


  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleDonateToPool = () => {
    if (selectedCampaigns.length > 0) {
      const query = new URLSearchParams({
        ids: selectedCampaigns.join(','),
      }).toString();
      router.push(`/donations/pool?${query}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center px-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Support Our Campaigns
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Your contribution makes a difference. Select one or more campaigns to
          create a donation pool.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
             Array.from({ length: 3 }).map((_, i) => <CampaignCardSkeleton key={i} />)
        ) : (
            campaigns.map((campaign) => {
            const image = PlaceHolderImages.find(
                (img) => img.id === campaign.imageId
            );
            const progress = (campaign.raised / campaign.goal) * 100;
            const isSelected = selectedCampaigns.includes(campaign.id);
            return (
                <Card
                key={campaign.id}
                className={cn(
                    'flex flex-col overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative',
                    isSelected && 'ring-2 ring-primary'
                )}
                >
                <CampaignCategoryBadge category={campaign.category} />
                {image && (
                    <div className="aspect-video overflow-hidden">
                    <Image
                        src={image.imageUrl}
                        alt={campaign.title}
                        width={600}
                        height={400}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={image.imageHint}
                    />
                    </div>
                )}
                <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                    <CardTitle className="group-hover:text-primary transition-colors">
                        {campaign.title}
                    </CardTitle>
                    <Checkbox
                        id={`campaign-${campaign.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleCampaignSelect(campaign.id)}
                        className="h-5 w-5 mt-1"
                    />
                    </div>
                    <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span className="font-semibold">
                        ৳{campaign.raised.toLocaleString()}
                        </span>
                        <span className="text-right">
                        ৳{campaign.goal.toLocaleString()} Goal
                        </span>
                    </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                    <Link href={`/donations/${campaign.slug}`}>
                        Donate Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    </Button>
                </CardFooter>
                </Card>
            );
            })
        )}
      </div>

      {selectedCampaigns.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
          <div className="container mx-auto">
            <div className="bg-background border rounded-lg shadow-2xl p-4 flex justify-between items-center">
              <p className="font-semibold">
                {selectedCampaigns.length} campaign(s) selected
              </p>
              <Button onClick={handleDonateToPool}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Donate to Pool
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
