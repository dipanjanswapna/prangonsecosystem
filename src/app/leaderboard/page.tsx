
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Star, Trophy, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Role } from '@/lib/roles';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface User {
  id: string;
  name: string;
  role: Role;
  level?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points?: number;
  photoURL?: string;
}

interface Campaign {
    id: string;
    title: string;
    raisedAmount: number;
    imageId: string;
}

const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-amber-400 fill-amber-400';
    if (rank === 1) return 'text-slate-400 fill-slate-400';
    if (rank === 2) return 'text-amber-600 fill-amber-600';
    return 'text-muted-foreground';
}

function DonorLeaderboard() {
  const { data: users, loading } = useCollection<User>('users', undefined, undefined, { field: 'points', direction: 'desc' }, 10);

  return (
    <CardContent className="space-y-4">
        {loading ? (
             Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-6 w-1/5" />
                </div>
            ))
        ) : (
            users.map((user, index) => (
                 <div key={user.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 w-10">
                        <Trophy className={cn("h-5 w-5", getRankColor(index))} />
                        <span className="font-bold text-lg">{index + 1}</span>
                    </div>
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={user.photoURL} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-semibold text-base">{user.name}</p>
                        <Badge variant="secondary" className="mt-1">{user.level || 'Bronze'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                        <span>{user.points?.toLocaleString() || 0}</span>
                    </div>
                </div>
            ))
        )}
    </CardContent>
  );
}

function CampaignLeaderboard() {
    const { data: campaigns, loading } = useCollection<Campaign>('campaigns', undefined, undefined, { field: 'raisedAmount', direction: 'desc' }, 10);
    
    const campaignImages = useMemo(() => {
        return campaigns.map(campaign => {
            return PlaceHolderImages.find(img => img.id === campaign.imageId);
        });
    }, [campaigns]);

    return (
        <CardContent className="space-y-4">
        {loading ? (
             Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-10 w-16 rounded-md" />
                    <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-6 w-1/4" />
                </div>
            ))
        ) : (
            campaigns.map((campaign, index) => (
                 <div key={campaign.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 w-10">
                        <Trophy className={cn("h-5 w-5", getRankColor(index))} />
                        <span className="font-bold text-lg">{index + 1}</span>
                    </div>
                    <Avatar className="h-12 w-16 rounded-md border-2 border-primary/20">
                         {campaignImages[index] && <AvatarImage src={campaignImages[index]?.imageUrl} alt={campaign.title} className="object-cover" />}
                        <AvatarFallback>{campaign.title?.charAt(0) || 'C'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-semibold text-base">{campaign.title}</p>
                    </div>
                    <div className="font-bold text-lg">
                        ৳{campaign.raisedAmount?.toLocaleString() || 0}
                    </div>
                </div>
            ))
        )}
    </CardContent>
    )
}

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Leaderboards
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          See who's making the biggest impact and which campaigns are trending.
        </p>
      </div>

      <Tabs defaultValue="donors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="donors">
            <Crown className="mr-2 h-4 w-4" />
            Top Donors
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <TrendingUp className="mr-2 h-4 w-4" />
            Top Campaigns
          </TabsTrigger>
        </TabsList>
        <TabsContent value="donors">
          <Card>
            <CardHeader>
              <CardTitle>Top Donors</CardTitle>
              <CardDescription>
                Our most generous contributors. Thank you for your amazing support!
              </CardDescription>
            </CardHeader>
            <DonorLeaderboard />
          </Card>
        </TabsContent>
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Top Campaigns</CardTitle>
              <CardDescription>
                The campaigns that are receiving the most support from our community.
              </CardDescription>
            </CardHeader>
            <CampaignLeaderboard />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
