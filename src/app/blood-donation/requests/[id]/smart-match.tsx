'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Loader2, Star, User, PhoneCall, UserRound } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  photoURL?: string;
  bloodGroup: string;
  isEligible?: boolean;
  address?: {
    district?: string;
    division?: string;
  };
  level?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  phone?: string;
}

const bloodCompatibility: { [key: string]: string[] } = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

const getCompatibleBloodGroups = (recipientGroup: string): string[] => {
  return bloodCompatibility[recipientGroup] || [];
};

function MatchSkeleton() {
    return (
        <div className="flex items-center gap-4 p-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
        </div>
    )
}

export function SmartMatch({
  bloodGroup,
  location,
}: {
  bloodGroup: string;
  location: string;
}) {
  const compatibleGroups = getCompatibleBloodGroups(bloodGroup);

  const { data: users, loading } = useCollection<UserProfile>(
    'users',
    undefined,
    undefined,
    undefined,
    undefined,
    [
        ['isEligible', '==', true],
        ['bloodGroup', 'in', compatibleGroups]
    ]
  );
  
  const [district] = location.split(',').map(s => s.trim()).reverse();

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
        const aIsSameDistrict = a.address?.district === district;
        const bIsSameDistrict = b.address?.district === district;

        if(aIsSameDistrict && !bIsSameDistrict) return -1;
        if(!aIsSameDistrict && bIsSameDistrict) return 1;

        const levelOrder = { 'Platinum': 4, 'Gold': 3, 'Silver': 2, 'Bronze': 1 };
        const aLevel = levelOrder[a.level || 'Bronze'] || 0;
        const bLevel = levelOrder[b.level || 'Bronze'] || 0;

        return bLevel - aLevel;
    });
  }, [users, district]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full text-lg" variant="default">
          <BrainCircuit className="mr-2 h-5 w-5" />
          Find Best Matches
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Smart Donor Recommendations</DialogTitle>
          <DialogDescription>
            Based on blood group compatibility and location, here are the top
            potential donors for your request.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
            {loading ? (
                <>
                    <MatchSkeleton />
                    <MatchSkeleton />
                    <MatchSkeleton />
                </>
            ) : sortedUsers.length > 0 ? (
                sortedUsers.map(user => (
                     <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={user.photoURL} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{user.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline">{user.bloodGroup}</Badge>
                                {user.level && <Badge variant="secondary" className="gap-1 items-center"><Star className="h-3 w-3"/>{user.level}</Badge>}
                                {user.address?.district && <p>{user.address.district}</p>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" asChild>
                                <Link href={`/auth/profile?uid=${user.id}`} target="_blank">
                                    <UserRound className="h-4 w-4" />
                                    <span className="sr-only">View Profile</span>
                                </Link>
                            </Button>
                            <Button variant="outline" size="icon" disabled={!user.phone} asChild>
                                <a href={`tel:${user.phone}`}>
                                    <PhoneCall className="h-4 w-4" />
                                    <span className="sr-only">Call Donor</span>
                                </a>
                            </Button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-muted-foreground py-8">No eligible donors found matching the criteria.</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
