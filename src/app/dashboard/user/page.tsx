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
import { Book, BrainCircuit, Calculator, Copy, Gift, Package, Star, Trophy, Users, CalendarDays, Droplets, HeartHandshake, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Timestamp } from 'firebase/firestore';

interface UserProfile {
  referralCode?: string;
  level?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points?: number;
  lastGiftClaimedAt?: Timestamp;
  bloodGroup?: string;
  totalDonations?: number;
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {userProfile && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            My Status & Rewards
                        </CardTitle>
                        <CardDescription>Your current level, points, and progress toward the next reward. (1 Point = 100 BDT Donated, 1 Blood Donation = 10 Points)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
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
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="font-semibold text-muted-foreground flex items-center gap-2">
                                <Gift className="h-4 w-4" />
                                Reward History
                            </h4>
                            {userProfile.lastGiftClaimedAt ? (
                                <div className="flex items-center gap-3 text-sm p-3 bg-muted/50 rounded-lg">
                                    <CalendarDays className="h-5 w-5 text-primary" />
                                    <div>
                                        <p>Last gift claimed on:</p>
                                        <p className="font-semibold">{new Date(userProfile.lastGiftClaimedAt.seconds * 1000).toLocaleString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No gifts claimed yet. Keep earning points!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Droplets className="h-5 w-5" />
                            My Blood Group
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {userProfile?.bloodGroup && userProfile.bloodGroup !== 'Not Set' ? (
                            <div>
                                <p className="text-sm text-muted-foreground">Your registered blood group is:</p>
                                <p className="text-3xl font-bold">{userProfile.bloodGroup}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Your blood group is not set. Please update your profile to become a potential donor.</p>
                        )}
                        <Button asChild variant="outline">
                            <Link href="/auth/profile">Update Profile</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Blood Donations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{userProfile?.totalDonations || 0}</p>
                        <p className="text-sm text-muted-foreground">lives impacted by you</p>
                    </CardContent>
                </Card>
            </div>
            
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

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ListChecks className="h-5 w-5" />
                        My Blood Donation Activity
                    </CardTitle>
                    <CardDescription>Track the status of your blood requests and your responses to others' requests.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                    <Button asChild size="lg" variant="outline">
                        <Link href="/dashboard/user/blood-requests">My Requests</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/dashboard/user/responses">My Responses (Upcoming Donations)</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        My Monetary Donations
                    </CardTitle>
                    <CardDescription>View your financial contribution history and see the impact you're making.</CardDescription>
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
                    <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copy referral link">
                        <Copy className="h-4 w-4" />
                    </Button>
                    </div>
                </div>
                 <Button asChild variant="secondary" className="w-full">
                        <Link href="/dashboard/user/referrals">View My Referrals</Link>
                    </Button>
                </CardContent>
            </Card>
            )}
        </div>
    </div>
  );
}
