'use client';

import {
  notFound,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { HandHeart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, Suspense, Fragment } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { saveDonation } from '@/lib/donations';
import { useUser } from '@/firebase/auth/use-user';
import { campaigns } from '@/lib/placeholder-data';
import { Separator } from '@/components/ui/separator';

function GatewayIcon({
  name,
  src,
  isSelected,
  onClick,
}: {
  name: string;
  src: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all',
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-transparent hover:bg-muted'
      )}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={name}
        width={60}
        height={40}
        className="object-contain rounded-md"
      />
    </div>
  );
}

function PoolDonationForm() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const selectedIds = useMemo(() => {
    const ids = searchParams.get('ids');
    return ids ? ids.split(',').map(Number) : [];
  }, [searchParams]);

  const selectedCampaigns = useMemo(
    () => campaigns.filter((c) => selectedIds.includes(c.id)),
    [selectedIds]
  );

  const [totalAmount, setTotalAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (selectedCampaigns.length === 0) {
    notFound();
  }

  const amountPerCampaign =
    selectedCampaigns.length > 0 && totalAmount
      ? Number(totalAmount) / selectedCampaigns.length
      : 0;

  const gateways = [
    { name: 'bKash', src: 'https://i.ibb.co/609yv0N/bkash.png' },
    { name: 'Nagad', src: 'https://i.ibb.co/qMs2N1x/nagad.png' },
    { name: 'Rocket', src: 'https://i.ibb.co/mX1x12s/rocket.png' },
    { name: 'SSLCommerz', src: 'https://i.ibb.co/fCwH1s9/sslcommerz.png' },
    { name: 'SurjoPay', src: 'https://i.ibb.co/3s6K3h7/surjopay.png' },
  ];

  const handleProceedToPay = async () => {
    const donationAmount = Number(totalAmount);
    if (isNaN(donationAmount) || donationAmount < selectedCampaigns.length * 0.01) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: `Please enter a valid total amount. Minimum is ৳${(selectedCampaigns.length * 0.01).toFixed(2)}.`,
      });
      return;
    }
    if (!name && !isAnonymous) {
      toast({
        variant: 'destructive',
        title: 'Name Required',
        description: 'Please enter your name or choose to be anonymous.',
      });
      return;
    }
    if (!email && !isAnonymous) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email or choose to be anonymous.',
      });
      return;
    }
    if (!selectedGateway) {
      toast({
        variant: 'destructive',
        title: 'Payment Method Required',
        description: 'Please select a payment method.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const donationPromises = selectedCampaigns.map((campaign) => {
        const donationData = {
          userId: user?.uid || null,
          campaignId: String(campaign.id),
          campaignTitle: campaign.title,
          amount: amountPerCampaign,
          currency: 'BDT',
          gateway: selectedGateway,
          status: 'pending' as const,
          isAnonymous,
          donorName: isAnonymous ? 'Anonymous' : name,
          donorEmail: isAnonymous ? null : email,
        };
        return saveDonation(donationData);
      });

      const results = await Promise.all(donationPromises);
      
      toast({
        title: 'Donations Processing!',
        description: `Thank you for contributing to ${results.length} campaigns.`,
      });

      // Redirect to the user's donation history page
      router.push(`/dashboard/user/donations`);

    } catch (error) {
      console.error('Donation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Donation Failed',
        description: 'Could not save your donations. Please try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">
            Donate to a Pool of Campaigns
          </CardTitle>
          <CardDescription>
            Your contribution will be equally distributed among the selected campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label className="text-lg font-medium">Selected Campaigns ({selectedCampaigns.length})</Label>
            <div className="border rounded-lg p-4 space-y-3">
              {selectedCampaigns.map((campaign, index) => (
                <Fragment key={campaign.id}>
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{campaign.title}</p>
                    <p className="text-muted-foreground">৳{amountPerCampaign.toFixed(2)}</p>
                  </div>
                  {index < selectedCampaigns.length - 1 && <Separator />}
                </Fragment>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="amount" className="text-lg font-medium">Total Donation Amount (BDT)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground sm:text-sm">৳</span>
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="Enter total amount"
                className="pl-7 text-lg h-14"
                min="0.01"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-medium">Your Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., John Doe"
                  disabled={isAnonymous}
                  value={isAnonymous ? 'Anonymous' : name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., john.doe@example.com"
                  disabled={isAnonymous}
                  value={isAnonymous ? '' : email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <Label htmlFor="anonymous" className="text-sm font-normal">
                Make my donations anonymous
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-medium">Select Payment Method</Label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 items-center justify-items-center rounded-lg bg-muted/50 p-4">
              {gateways.map((gateway) => (
                <GatewayIcon
                  key={gateway.name}
                  name={gateway.name}
                  src={gateway.src}
                  isSelected={selectedGateway === gateway.name}
                  onClick={() => setSelectedGateway(gateway.name)}
                />
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handleProceedToPay}
            disabled={isLoading || !totalAmount}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <HandHeart className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Processing...' : `Donate ৳${totalAmount || '0.00'}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


export default function PoolDonationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PoolDonationForm />
        </Suspense>
    )
}
