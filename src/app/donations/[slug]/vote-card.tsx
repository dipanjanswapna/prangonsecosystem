'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { castVote, type VoteCategory } from '@/lib/votes';
import { cn } from '@/lib/utils';
import { Check, Vote } from 'lucide-react';
import { useMemo } from 'react';

interface VoteCardProps {
  campaignId: string;
}

interface Vote {
  id: string;
  userId: string;
  category: VoteCategory;
}

const voteCategories: { id: VoteCategory; label: string }[] = [
  { id: 'food', label: 'Food & Nutrition' },
  { id: 'shelter', label: 'Shelter & Housing' },
  { id: 'health', label: 'Health & Medical' },
  { id: 'education', label: 'Education' },
  { id: 'logistics', label: 'Logistics' },
];

export function VoteCard({ campaignId }: VoteCardProps) {
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const { data: votes, loading: votesLoading } = useCollection<Vote>(
    'votes',
    'campaignId',
    campaignId
  );

  const userVote = useMemo(
    () => votes.find((v) => v.userId === user?.uid),
    [votes, user]
  );

  const voteCounts = useMemo(() => {
    const counts = voteCategories.reduce((acc, cat) => {
      acc[cat.id] = 0;
      return acc;
    }, {} as Record<VoteCategory, number>);

    votes.forEach((vote) => {
      if (counts[vote.category] !== undefined) {
        counts[vote.category]++;
      }
    });

    return counts;
  }, [votes]);

  const totalVotes = votes.length;

  const handleVote = async (category: VoteCategory) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to cast your vote.',
      });
      return;
    }
    try {
      await castVote(user.uid, campaignId, category);
      toast({
        title: 'Vote Cast!',
        description: `Your vote for "${
          voteCategories.find((c) => c.id === category)?.label
        }" has been recorded.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Voting Failed',
        description: error.message || 'Could not record your vote.',
      });
    }
  };

  const isLoading = userLoading || votesLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-6 w-6 text-primary" />
          Cast Your Vote
        </CardTitle>
        <CardDescription>
          Help us decide where to prioritize the funds for this campaign. Your
          voice matters!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {voteCategories.map((category) => {
          const count = voteCounts[category.id] || 0;
          const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const isUserVotedForThis = userVote?.category === category.id;

          return (
            <div key={category.id} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{category.label}</span>
                <span className="text-muted-foreground">
                  {count} votes ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <Progress value={percentage} className="h-2 flex-grow" />
                <Button
                  size="sm"
                  variant={isUserVotedForThis ? 'secondary' : 'outline'}
                  onClick={() => handleVote(category.id)}
                  disabled={!user}
                  className={cn(isUserVotedForThis && "font-bold")}
                >
                  {isUserVotedForThis && (
                    <Check className="mr-1.5 h-4 w-4" />
                  )}
                  {isUserVotedForThis ? 'Voted' : 'Vote'}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
