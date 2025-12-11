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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  BadgeCheck,
  Calendar,
  HeartHandshake,
  Hospital,
  Info,
  Loader2,
  Phone,
  User,
} from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { markRequestAsFulfilled } from '@/lib/blood';

interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  reason: string;
  quantity: number;
  hospitalName: string;
  location: string;
  status: 'pending' | 'fulfilled' | 'closed';
  neededBy: { seconds: number; nanoseconds: number };
  createdAt: { seconds: number; nanoseconds: number };
  contactPerson: string;
  contactPhone: string;
  requesterId: string;
  donorId?: string;
  donorName?: string;
}

interface UserProfile {
    id: string;
    name: string;
    photoURL?: string;
}


const bloodGroupStyles: { [key: string]: string } = {
  'A+': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  'A-': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  'B+': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  'B-': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  'AB+': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
  'AB-': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
  'O+': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  'O-': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
};

const RequestDetailsSkeleton = () => (
  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="md:col-span-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-8 w-3/4 mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-12 w-full" />
        </CardFooter>
      </Card>
    </div>
    <div className="md:col-span-1">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function RequestDetailsPage() {
  const params = useParams();
  const { id } = params;
  const { user, loading: userLoading } = useUser();
  const { data: request, loading: requestLoading } = useDoc<BloodRequest>(
    id ? `bloodRequests/${id}` : null
  );
  const [showContact, setShowContact] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleMarkAsFulfilled = async (donor: UserProfile) => {
      if (!request) return;
      try {
          await markRequestAsFulfilled(request.id, donor.id);
          toast({
              title: "Request Fulfilled!",
              description: "Thank you for updating. The donor has been awarded points."
          });
          router.push('/blood-donation');
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: 'Update Failed',
              description: error.message || "Could not mark the request as fulfilled."
          })
      }
  }

  if (requestLoading || userLoading) {
    return <RequestDetailsSkeleton />;
  }

  if (!request) {
    notFound();
  }

  const isRequester = user?.uid === request.requesterId;
  const isFulfilled = request.status === 'fulfilled';

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'flex items-center justify-center h-20 w-20 rounded-full font-bold text-3xl border-4',
                  bloodGroupStyles[request.bloodGroup] || ''
                )}
              >
                {request.bloodGroup}
              </div>
              {isFulfilled ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold py-1 px-3 rounded-full bg-green-100 dark:bg-green-900/30">
                      <BadgeCheck className="h-5 w-5" />
                      <span>Fulfilled</span>
                  </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold py-1 px-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Pending</span>
                </div>
              )}
            </div>
            <CardTitle className="pt-4 font-headline text-3xl">
              Urgent need for {request.quantity} bag(s) of{' '}
              {request.bloodGroup} blood
            </CardTitle>
            <CardDescription>
              For patient: {request.patientName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-full">
              <p>{request.reason}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Hospital className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Hospital</p>
                  <p className="text-muted-foreground">
                    {request.hospitalName}, {request.location}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Date Needed By</p>
                  <p className="text-muted-foreground">
                    {new Date(request.neededBy.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Contact Person</p>
                  <p className="text-muted-foreground">{request.contactPerson}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Contact Phone</p>
                  {showContact ? (
                    <a href={`tel:${request.contactPhone}`} className='text-primary font-bold text-lg hover:underline'>{request.contactPhone}</a>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (user) {
                          setShowContact(true);
                        } else {
                          toast({
                            variant: 'destructive',
                            title: 'Login Required',
                            description:
                              'Please log in to view contact information.',
                          });
                        }
                      }}
                    >
                      Show Contact Info
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {!isRequester && !isFulfilled && (
              <Button size="lg" className="w-full">
                <HeartHandshake className="mr-2 h-5 w-5" /> I Will Donate
              </Button>
            )}
             {isRequester && !isFulfilled && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg" className="w-full" variant="secondary">
                            <BadgeCheck className="mr-2 h-5 w-5" /> Mark as Fulfilled
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Who was the donor?</DialogTitle>
                        <DialogDescription>
                            Select the hero who donated blood to award them points for their contribution.
                        </DialogDescription>
                        </DialogHeader>
                        <DonorSelectionDialog onSelectDonor={handleMarkAsFulfilled} />
                    </DialogContent>
                </Dialog>
            )}
            {isFulfilled && request.donorName && (
                 <div className="w-full text-center text-green-600 dark:text-green-400">
                    This request was fulfilled by the hero: <strong>{request.donorName}</strong>.
                 </div>
            )}
          </CardFooter>
        </Card>
      </div>
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Please verify all details with the contact person before proceeding.</p>
            <p>Ensure you meet all health requirements for blood donation.</p>
            <p>Do not pay any money for blood donation. It is a voluntary act.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DonorSelectionDialog({ onSelectDonor }: { onSelectDonor: (donor: UserProfile) => void }) {
    const { data: users, loading } = useCollection<UserProfile>('users');
    const [selectedDonor, setSelectedDonor] = useState<UserProfile | null>(null);

    return (
        <div>
            <div className="max-h-64 overflow-y-auto space-y-2 my-4 pr-2">
                {loading && <Loader2 className="mx-auto animate-spin" />}
                {users.map(user => (
                    <div
                        key={user.id}
                        onClick={() => setSelectedDonor(user)}
                        className={cn("flex items-center gap-3 p-2 rounded-lg cursor-pointer border-2",
                            selectedDonor?.id === user.id ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted'
                        )}
                    >
                        <Avatar>
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                    </div>
                ))}
            </div>
            <Button className="w-full" disabled={!selectedDonor} onClick={() => selectedDonor && onSelectDonor(selectedDonor)}>
                Confirm Donor & Fulfill
            </Button>
        </div>
    )
}
