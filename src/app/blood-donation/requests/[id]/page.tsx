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
  MessageSquare,
  PhoneCall,
  UserRound,
  Clock,
  Briefcase,
  FileText,
  Edit,
} from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
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
import { markRequestAsFulfilled, respondToRequest } from '@/lib/blood';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';


interface BloodRequest {
  id: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  donationType: 'Whole Blood' | 'Platelets' | 'Plasma';
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
  urgencyLevel?: 'Normal' | 'Urgent' | 'Critical';
  preferredTime?: string;
  notes?: string;
}

interface UserProfile {
  id: string;
  uid: string;
  name: string;
  phone?: string;
  photoURL?: string;
}

interface DonationResponse {
    id: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
}

type CombinedResponder = DonationResponse & { profile?: UserProfile };


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

const urgencyStyles: { [key: string]: string } = {
    'Normal': 'bg-blue-100 text-blue-800',
    'Urgent': 'bg-amber-100 text-amber-800',
    'Critical': 'bg-red-100 text-red-800',
}

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
  const requestId = id as string;
  const { user, loading: userLoading } = useUser();
  const { data: request, loading: requestLoading } = useDoc<BloodRequest>(
    requestId ? `bloodRequests/${requestId}` : null
  );
  const { data: responses, loading: responsesLoading } = useCollection<DonationResponse>(
    requestId ? `bloodRequests/${requestId}/responses` : null
  );
  
  const responderIds = useMemo(() => responses.map(r => r.userId), [responses]);

  const { data: responderProfiles, loading: profilesLoading } = useCollection<UserProfile>(
      'users',
      undefined,
      undefined,
      undefined,
      undefined,
      responderIds.length > 0 ? [['uid', 'in', responderIds]] : undefined
  );
  
  const [combinedResponders, setCombinedResponders] = useState<CombinedResponder[]>([]);

  useEffect(() => {
    // We combine responses with their profiles.
    // If profiles are still loading, we can show responses with whatever data we have.
    if (responses.length > 0) {
      const combined = responses.map(response => {
        const profile = responderProfiles.find(p => p.id === response.userId);
        return { ...response, profile };
      });
      setCombinedResponders(combined);
    } else {
        setCombinedResponders([]);
    }
  }, [responses, responderProfiles]);


  const [showContact, setShowContact] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleMarkAsFulfilled = async (donor: DonationResponse) => {
    if (!request) return;
    try {
      await markRequestAsFulfilled(request.id, donor.userId, donor.userName);
      toast({
        title: 'Request Fulfilled!',
        description: 'Thank you for updating. The donor has been awarded points.',
      });
      // No need to redirect, the page will update automatically due to real-time listener
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not mark the request as fulfilled.',
      });
    }
  };

  const handleRespondToRequest = async () => {
      if (!user) {
          toast({ variant: 'destructive', title: 'Login Required', description: 'You must be logged in to respond.' });
          return;
      }
       if (!request) return;
      try {
          await respondToRequest(request.id, user);
          toast({ title: "Response Recorded", description: "The requester has been notified of your willingness to donate." });
      } catch(error: any) {
           toast({ variant: 'destructive', title: 'Response Failed', description: error.message || 'Could not record your response.' });
      }

  }

  if (requestLoading || userLoading || profilesLoading) {
    return <RequestDetailsSkeleton />;
  }

  if (!request) {
    notFound();
  }

  const isRequester = user?.uid === request.requesterId;
  const isPending = request.status === 'pending';
  const hasUserResponded = responses.some(res => res.userId === user?.uid);

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
             <div className="flex items-start justify-between">
              <div
                className={cn(
                  'flex items-center justify-center h-20 w-20 rounded-full font-bold text-3xl border-4',
                  bloodGroupStyles[request.bloodGroup] || ''
                )}
              >
                {request.bloodGroup}
              </div>
              <div className="flex flex-col items-end gap-2">
                 <Badge variant={request.status === 'fulfilled' ? 'secondary' : request.status === 'pending' ? 'default' : 'destructive'} className='capitalize'>
                    {request.status}
                 </Badge>
                {request.urgencyLevel && (
                    <Badge className={cn('capitalize', urgencyStyles[request.urgencyLevel])}>
                        {request.urgencyLevel}
                    </Badge>
                )}
                {isRequester && isPending && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/blood-donation/requests/${request.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <CardTitle className="pt-4 font-headline text-3xl">
              Urgent need for {request.quantity} bag(s) of{' '}
              {request.donationType || 'blood'}
            </CardTitle>
            <CardDescription>
              For patient: {request.patientName} ({request.patientAge}, {request.patientGender})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-full">
              <h4 className='font-semibold'>Reason:</h4>
              <p>{request.reason}</p>
              {request.notes && (
                  <>
                    <h4 className='font-semibold mt-4'>Additional Notes:</h4>
                    <p>{request.notes}</p>
                  </>
              )}
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
                    {new Date(
                      request.neededBy.seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
               <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Preferred Time</p>
                  <p className="text-muted-foreground">
                    {request.preferredTime || 'Not specified'}
                  </p>
                </div>
              </div>
               <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Donation Type</p>
                  <p className="text-muted-foreground">
                    {request.donationType}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Contact Person</p>
                  <p className="text-muted-foreground">
                    {request.contactPerson}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Contact Phone</p>
                  {showContact ? (
                    <a
                      href={`tel:${request.contactPhone}`}
                      className="text-primary font-bold text-lg hover:underline"
                    >
                      {request.contactPhone}
                    </a>
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
            {!isRequester && isPending && (
              <Button size="lg" className="w-full" onClick={handleRespondToRequest} disabled={hasUserResponded}>
                <HeartHandshake className="mr-2 h-5 w-5" />
                {hasUserResponded ? 'Response Sent' : 'I Will Donate'}
              </Button>
            )}
            {isRequester && isPending && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="w-full"
                    variant="secondary"
                    disabled={responses.length === 0}
                  >
                    <BadgeCheck className="mr-2 h-5 w-5" /> Mark as Fulfilled
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl'>
                  <DialogHeader>
                    <DialogTitle>Who was the donor?</DialogTitle>
                    <DialogDescription>
                      Select the hero who donated blood to award them points for their contribution. You can view their profile or contact them before confirming.
                    </DialogDescription>
                  </DialogHeader>
                  <DonorSelectionDialog
                    responses={combinedResponders}
                    loading={responsesLoading || profilesLoading}
                    onSelectDonor={handleMarkAsFulfilled}
                  />
                </DialogContent>
              </Dialog>
            )}
            {!isPending && request.donorName && (
              <div className="w-full text-center text-green-600 dark:text-green-400">
                This request was fulfilled by the hero:{' '}
                <strong>{request.donorName}</strong>.
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
            <p>
              Please verify all details with the contact person before
              proceeding.
            </p>
            <p>Ensure you meet all health requirements for blood donation.</p>
            <p>
              Do not pay any money for blood donation. It is a voluntary act.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DonorSelectionDialog({
  responses,
  loading,
  onSelectDonor,
}: {
  responses: CombinedResponder[];
  loading: boolean;
  onSelectDonor: (donor: DonationResponse) => void;
}) {
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);

  if (loading) {
    return <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />;
  }

  if (responses.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No donors have responded yet.
      </p>
    );
  }

  return (
    <div>
      <div className="max-h-96 overflow-y-auto space-y-2 my-4 pr-2">
        {responses.map((res) => {
          const isSelected = selectedDonorId === res.id;
          return (
            <div
              key={res.id}
              onClick={() => setSelectedDonorId(res.id)}
              className={cn(
                'p-3 rounded-lg border-2 cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              )}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={res.userPhotoURL} />
                  <AvatarFallback>
                    {res.userName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <p className="font-semibold">{res.userName}</p>
                    <p className="text-sm text-muted-foreground">ID: {res.userId.substring(0, 8)}...</p>
                </div>
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/auth/profile?uid=${res.userId}`} target="_blank">
                             <UserRound className="mr-1.5 h-4 w-4" /> Profile
                        </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={!res.profile?.phone}>
                            <Phone className="mr-1.5 h-4 w-4" /> Contact
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <a href={`tel:${res.profile?.phone}`}>
                                <PhoneCall className="mr-2 h-4 w-4" /> Call
                            </a>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                             <a href={`https://wa.me/${res.profile?.phone}`} target="_blank" rel="noopener noreferrer">
                               <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
                            </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
      <Button
        className="w-full"
        disabled={!selectedDonorId}
        onClick={() => {
          const selectedDonor = responses.find(r => r.id === selectedDonorId);
          if (selectedDonor) onSelectDonor(selectedDonor);
        }}
      >
        Confirm Donor & Fulfill Request
      </Button>
    </div>
  );
}
