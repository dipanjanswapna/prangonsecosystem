'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useToast } from '@/hooks/use-toast';
import { Book, BrainCircuit, Calculator, Copy, Gift, Package, Star, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  referralCode?: string;
  level?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points?: number;
}

const levelThresholds = {
    Bronze: 0,
    Silver: 1000,
    Gold: 5000,
    Platinum: 10000,
};

const nextLevel: Record<string, 'Silver' | 'Gold' | 'Platinum' | null> = {
    Bronze: 'Silver',
    Silver: 'Gold',
    Gold: 'Platinum',
    Platinum: null,
};


export default function UserDashboard() {
  const { user } = useUser();
  const { data: userProfile } = useDoc<UserProfile>(user ? `users/${user.uid}` : null);
  const { toast } = useToast();

  const learningTools = [
    {
      title: 'eBook Library',
      description: 'Access our collection of eBooks and resources.',
      icon: Book,
      href: '/library',
    },
    {
      title: 'AI Content Tools',
      description: 'Generate outlines and drafts for your content.',
      icon: BrainCircuit,
      href: '/ai-tools',
    },
    {
      title: 'GPA Calculator',
      description: 'Calculate your GPA and track your academic progress.',
      icon: Calculator,
      href: '#',
    },
  ];

  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register?ref=${userProfile?.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Link Copied!',
      description: 'Your referral link has been copied to the clipboard.',
    });
  };
  
  const currentLevel = userProfile?.level || 'Bronze';
  const currentPoints = userProfile?.points || 0;
  const nextLevelName = nextLevel[currentLevel];
  const nextLevelPoints = nextLevelName ? levelThresholds[nextLevelName] : currentPoints;
  const progressPercentage = nextLevelName ? (currentPoints / nextLevelPoints) * 100 : 100;
  const pointsForNextLevel = nextLevelName ? nextLevelPoints - currentPoints : 0;


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Dashboard</CardTitle>
          <CardDescription>
            Welcome back! Here are your learning tools and notifications.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        
        {userProfile && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        My Status
                    </CardTitle>
                    <CardDescription>Your current level, points, and progress.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Badge className="text-lg py-1 px-4 border-2" variant={currentLevel === 'Platinum' ? 'destructive' : currentLevel === 'Gold' ? 'default' : 'secondary'}>
                                {currentLevel}
                            </Badge>
                            <div className="flex items-center gap-1.5">
                                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                                <span className="font-bold text-xl">{currentPoints.toLocaleString()}</span>
                                <span className="text-muted-foreground">Points</span>
                            </div>
                        </div>
                    </div>
                     {nextLevelName ? (
                        <div>
                            <div className="mb-2 text-sm text-muted-foreground">
                                Next Level: <span className="font-semibold text-foreground">{nextLevelName}</span> ({nextLevelPoints.toLocaleString()} points)
                            </div>
                            <Progress value={progressPercentage} className="h-3" />
                            <p className="text-xs text-muted-foreground mt-1 text-right">
                                {pointsForNextLevel.toLocaleString()} more points to reach {nextLevelName}
                            </p>
                        </div>
                    ) : (
                         <p className="text-sm font-medium text-green-600">Congratulations! You have reached the highest level!</p>
                    )}
                </CardContent>
            </Card>
        )}

        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Donations
             </CardTitle>
             <CardDescription>View your contribution history and see the impact you're making.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
                <Link href="/dashboard/user/donations">View My Donations</Link>
            </Button>
          </CardContent>
        </Card>

        {userProfile?.referralCode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                My Referrals
              </CardTitle>
              <CardDescription>
                Invite friends to join and earn rewards! Share your unique referral link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Referral Code</p>
                <p className="font-mono text-lg font-semibold bg-muted px-3 py-1 rounded-md inline-block">{userProfile.referralCode}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Shareable Link</p>
                <div className="flex gap-2">
                  <Input readOnly value={referralLink} className="bg-muted/50" />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Learning Tools</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {learningTools.map((tool) => (
              <Card key={tool.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    {tool.title}
                  </CardTitle>
                  <tool.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </CardContent>
                <CardContent>
                  <Button asChild>
                    <Link href={tool.href}>Open Tool</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
