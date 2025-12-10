'use client';

import { notFound, useRouter, useParams } from 'next/navigation';
import { campaigns } from '@/lib/placeholder-data';
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
import { Building, HandHeart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { saveDonation } from '@/lib/donations';
import { useUser } from '@/firebase/auth/use-user';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

function GatewayIcon({ name, src, isSelected, onClick }: { name: string; src: string; isSelected: boolean; onClick: () => void }) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all",
        isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"
      )}
      onClick={onClick}
    >
      <Image src={src} alt={name} width={60} height={40} className="object-contain rounded-md" />
    </div>
  );
}

export default function DonatePage() {
  const params = useParams();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const campaign = campaigns.find((c) => c.slug === params.slug);

  const [amount, setAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [donationFrequency, setDonationFrequency] = useState('one-time');
  const [isCorporateMatch, setIsCorporateMatch] = useState(false);
  const [corporateName, setCorporateName] = useState('');

  if (!campaign) {
    notFound();
  }

  const suggestedAmounts = [100, 250, 500, 1000];
  const gateways = [
      { name: "bKash", src: "https://i.ibb.co/609yv0N/bkash.png" },
      { name: "Nagad", src: "https://i.ibb.co/qMs2N1x/nagad.png" },
      { name: "Rocket", src: "https://i.ibb.co/mX1x12s/rocket.png" },
      { name: "SSLCommerz", src: "https://i.ibb.co/fCwH1s9/sslcommerz.png" },
      { name: "SurjoPay", src: "https://i.ibb.co/3s6K3h7/surjopay.png" },
  ];

  const handleAmountClick = (value: number) => {
    setAmount(String(value));
  };
  
  const handleProceedToPay = async () => {
    const donationAmount = Number(amount);
    if (isNaN(donationAmount) || donationAmount < 10) {
        toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid donation amount. Minimum is ৳10.' });
        return;
    }
    if (!name && !isAnonymous) {
        toast({ variant: 'destructive', title: 'Name Required', description: 'Please enter your name or choose to be anonymous.' });
        return;
    }
    if (!email && !isAnonymous) {
        toast({ variant: 'destructive', title: 'Email Required', description: 'Please enter your email or choose to be anonymous.' });
        return;
    }
     if (!selectedGateway) {
        toast({ variant: 'destructive', title: 'Payment Method Required', description: 'Please select a payment method.' });
        return;
    }
     if (isCorporateMatch && !corporateName) {
        toast({ variant: 'destructive', title: 'Company Name Required', description: 'Please enter your company\'s name for the match.' });
        return;
     }

    setIsLoading(true);

    try {
      const donationData = {
        userId: user?.uid || null,
        campaignId: String(campaign.id),
        campaignTitle: campaign.title,
        amount: donationAmount,
        currency: 'BDT',
        gateway: selectedGateway,
        status: 'pending' as const, 
        isAnonymous,
        donorName: isAnonymous ? 'Anonymous' : name,
        donorEmail: isAnonymous ? null : email,
        isCorporateMatch: isCorporateMatch,
        corporateName: isCorporateMatch ? corporateName : undefined,
      };

      const newDonationId = await saveDonation(donationData);

      toast({
          title: 'Processing Donation...',
          description: 'Thank you for your contribution! Redirecting to invoice...',
      });
      
      router.push(`/donations/invoice/${newDonationId}`);

    } catch (error) {
      console.error("Donation failed:", error);
      toast({
        variant: 'destructive',
        title: 'Donation Failed',
        description: 'Could not save your donation. Please try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">
            Support: {campaign.title}
          </CardTitle>
          <CardDescription>
            Your contribution will make a significant impact. Thank you for your
            generosity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label className="text-lg font-medium">Donation Frequency</Label>
            <RadioGroup
              defaultValue="one-time"
              className="grid grid-cols-2 gap-4"
              onValueChange={setDonationFrequency}
            >
              <div>
                <RadioGroupItem value="one-time" id="one-time" className="peer sr-only" />
                <Label
                  htmlFor="one-time"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  One-time
                </Label>
              </div>
              <div>
                <RadioGroupItem value="monthly" id="monthly" className="peer sr-only" />
                <Label
                  htmlFor="monthly"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Monthly
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="amount" className="text-lg font-medium">Choose an amount (BDT)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestedAmounts.map(value => (
                <Button key={value} variant={amount === String(value) ? 'default' : 'outline'} size="lg" className="h-16 text-xl" onClick={() => handleAmountClick(value)}>
                  ৳{value}
                </Button>
              ))}
            </div>
             <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground sm:text-sm">৳</span>
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="Or enter a custom amount"
                className="pl-7 text-lg h-14"
                min="10"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <Label className="text-lg font-medium">Your Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="name">Full Name</Label>
                 <Input id="name" placeholder="e.g., John Doe" disabled={isAnonymous} value={isAnonymous ? 'Anonymous' : name} onChange={(e) => setName(e.target.value)} />
               </div>
                <div className="space-y-2">
                 <Label htmlFor="email">Email Address</Label>
                 <Input id="email" type="email" placeholder="e.g., john.doe@example.com" disabled={isAnonymous} value={isAnonymous ? '' : email} onChange={(e) => setEmail(e.target.value)} />
               </div>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(checked) => setIsAnonymous(checked as boolean)} />
                <Label htmlFor="anonymous" className="text-sm font-normal">
                    Make my donation anonymous
                </Label>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <Label className="text-lg font-medium">Corporate Matching</Label>
            </div>
            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                <Checkbox id="corporate-match" checked={isCorporateMatch} onCheckedChange={(checked) => setIsCorporateMatch(checked as boolean)} />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="corporate-match" className="text-sm font-medium">
                        My company will match my donation.
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Double your impact! Check this box if your employer offers a donation matching program.
                    </p>
                </div>
            </div>
            {isCorporateMatch && (
                <div className="space-y-2 pl-4 pt-2">
                    <Label htmlFor="corporate-name">Company Name</Label>
                    <Input id="corporate-name" placeholder="e.g., Acme Corporation" value={corporateName} onChange={(e) => setCorporateName(e.target.value)} />
                </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
             <Label className="text-lg font-medium">Select Payment Method</Label>
             <div className="grid grid-cols-3 md:grid-cols-5 gap-4 items-center justify-items-center rounded-lg bg-muted/50 p-4">
                {gateways.map(gateway => (
                    <GatewayIcon key={gateway.name} name={gateway.name} src={gateway.src} isSelected={selectedGateway === gateway.name} onClick={() => setSelectedGateway(gateway.name)} />
                ))}
             </div>
          </div>

        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full text-lg" onClick={handleProceedToPay} disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <HandHeart className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Processing...' : 'Proceed to Pay'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
