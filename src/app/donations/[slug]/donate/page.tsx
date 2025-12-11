'use client';

import { notFound, useRouter, useParams, useSearchParams } from 'next/navigation';
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
import { useState, useEffect, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { saveDonation } from '@/lib/donations';
import { useUser } from '@/firebase/auth/use-user';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';

declare const bKash: any;

interface Campaign {
  id: string;
  title: string;
  slug: string;
  minAmount?: number;
}

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


function DonatePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { data: campaigns, loading } = useCollection<Campaign>('campaigns', 'slug', params.slug as string);
  const campaign = campaigns[0];


  const [amount, setAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<string | null>('bKash');
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bKashLoading, setBKashLoading] = useState(false);
  const [isBKashReady, setIsBKashReady] = useState(false);
  const [donationFrequency, setDonationFrequency] = useState<'one-time' | 'monthly'>('one-time');
  const [isCorporateMatch, setIsCorporateMatch] = useState(false);
  const [corporateName, setCorporateName] = useState('');

  // Effect to handle shurjoPay callback
  useEffect(() => {
    const spOrderId = localStorage.getItem('shurjopay_order_id');
    const ongonDonationId = localStorage.getItem('ongon_donation_id');
    const status = searchParams.get('status');
    
    if (status === 'success' && spOrderId && ongonDonationId) {
      setIsLoading(true);
      toast({ title: "Verifying Payment...", description: "Please wait while we confirm your transaction." });
      
      const verifyPayment = async () => {
        try {
          const response = await fetch('/api/shurjopay/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ongon_donation_id: ongonDonationId, sp_order_id: spOrderId }),
          });

          if (!response.ok) throw new Error('Verification failed on our server.');

          const result = await response.json();

          if(result.finalStatus === 'success') {
            toast({ title: "Payment Successful!", description: "Redirecting to your invoice." });
            router.push(`/donations/invoice/${ongonDonationId}`);
          } else {
            throw new Error('Payment was not successful according to shurjoPay.');
          }

        } catch (error: any) {
          toast({ variant: 'destructive', title: 'Payment Verification Failed', description: error.message });
          setIsLoading(false);
          router.replace(`/donations/${campaign.slug}/donate`);
        } finally {
          localStorage.removeItem('shurjopay_order_id');
          localStorage.removeItem('ongon_donation_id');
        }
      };

      verifyPayment();
    } else if (status === 'cancel' || status === 'fail') {
        toast({ variant: 'destructive', title: 'Payment Cancelled', description: 'Your transaction was cancelled or failed.' });
        localStorage.removeItem('shurjopay_order_id');
        localStorage.removeItem('ongon_donation_id');
        router.replace(`/donations/${campaign.slug}/donate`);
    }
  }, [searchParams, router, toast, campaign]);

  useEffect(() => {
    if (user) {
        setName(user.displayName || '');
        setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (selectedGateway === 'bKash' && typeof bKash !== 'undefined') {
      setIsLoading(true);
      setBKashLoading(true);

      const donationAmount = Number(amount) || 1; // Use a placeholder amount for init
      
      bKash.init({
        paymentMode: 'checkout',
        paymentRequest: {
          amount: String(donationAmount),
          intent: 'sale',
        },
        createRequest: async (request: any) => {
          try {
            const createResponse = await fetch('/api/bkash/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: request.amount, // Use the amount from the request
                invoiceNumber: (window as any).ongon_donation_id,
                payerReference: user?.email || email || 'N/A',
              }),
            });
            const createData = await createResponse.json();
            if (createData && createData.paymentID) {
              bKash.create().onSuccess(createData);
            } else {
              bKash.create().onError();
              throw new Error(createData.statusMessage || 'bKash create payment failed.');
            }
          } catch (error: any) {
              bKash.create().onError();
              toast({ variant: 'destructive', title: 'bKash Error', description: error.message });
              setIsLoading(false);
              setBKashLoading(false);
          }
        },
        executeRequestOnAuthorization: async () => {
          try {
              const executeResponse = await fetch('/api/bkash/execute', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                      paymentID: bKash.payment.getPaymentID(),
                      ongon_donation_id: (window as any).ongon_donation_id
                  }),
              });
              const executeData = await executeResponse.json();
              if (executeResponse.ok) {
                  toast({ title: "Payment Successful!", description: "Thank you for your generous donation." });
                  router.push(`/donations/invoice/${(window as any).ongon_donation_id}`);
              } else {
                  bKash.execute().onError();
                  throw new Error(executeData.message || 'Payment execution failed.');
              }
          } catch (error: any) {
               bKash.execute().onError();
               toast({ variant: 'destructive', title: 'bKash Execution Error', description: error.message });
               setIsLoading(false);
               setBKashLoading(false);
          }
        },
        onClose: () => {
          setIsLoading(false);
          setBKashLoading(false);
        },
      });
      setIsBKashReady(true);
      setIsLoading(false);
      setBKashLoading(false);
    }
  }, [selectedGateway, user, email, toast, router]);


  if (loading) {
      return (
          <div className='max-w-4xl mx-auto'>
              <Card>
                  <CardHeader className='text-center'>
                      <Skeleton className='h-8 w-3/4 mx-auto' />
                      <Skeleton className='h-5 w-1/2 mx-auto mt-2' />
                  </CardHeader>
                  <CardContent className='space-y-8'>
                      <div className='space-y-4'>
                          <Skeleton className='h-6 w-1/3' />
                          <div className='grid grid-cols-2 gap-4'>
                               <Skeleton className='h-16 w-full' />
                               <Skeleton className='h-16 w-full' />
                          </div>
                      </div>
                      <div className='space-y-4'>
                          <Skeleton className='h-6 w-1/3' />
                           <div className='grid grid-cols-4 gap-4'>
                               <Skeleton className='h-16 w-full' />
                               <Skeleton className='h-16 w-full' />
                               <Skeleton className='h-16 w-full' />
                               <Skeleton className='h-16 w-full' />
                           </div>
                           <Skeleton className='h-14 w-full' />
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Skeleton className='h-12 w-full' />
                  </CardFooter>
              </Card>
          </div>
      )
  }

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
    const minDonationAmount = campaign?.minAmount ?? 0.01;

    if (isNaN(donationAmount) || donationAmount < minDonationAmount) {
        toast({ variant: 'destructive', title: 'Invalid Amount', description: `Please enter a valid donation amount. Minimum is ৳${minDonationAmount}.` });
        return;
    }
    if (!name && !isAnonymous) {
        toast({ variant: 'destructive', title: 'Name Required', description: 'Please enter your name or choose to be an anonymous.' });
        return;
    }
    if (!email && !isAnonymous) {
        toast({ variant: 'destructive', title: 'Email Required', description: 'Please enter your email or choose to be an anonymous.' });
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
      const donationData: any = {
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
        frequency: donationFrequency,
        isCorporateMatch: isCorporateMatch,
        corporateName: isCorporateMatch ? corporateName : null,
      };

      // Save the donation with a 'pending' status first to get an ID
      const newDonationId = await saveDonation(donationData);
      (window as any).ongon_donation_id = newDonationId; // Store for bKash callbacks
      
      if (selectedGateway === 'bKash') {
        if (!isBKashReady) {
            throw new Error("bKash is not ready. Please wait a moment and try again.");
        }
        setBKashLoading(true);
        bKash.reconfigure({paymentRequest: { amount: String(donationAmount), intent: 'sale' }});
        bKash.create().onSuccess();
      } else if (selectedGateway === 'SurjoPay') {
        const response = await fetch('/api/shurjopay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: donationAmount,
            customer_name: donationData.donorName,
            customer_address: 'N/A',
            customer_phone: 'N/A',
            customer_city: 'N/A',
            customer_email: donationData.donorEmail,
            campaignSlug: campaign.slug,
          }),
        });
        const paymentResponse = await response.json();
        if (paymentResponse.checkout_url) {
          localStorage.setItem('shurjopay_order_id', paymentResponse.sp_order_id);
          localStorage.setItem('ongon_donation_id', newDonationId);
          window.location.href = paymentResponse.checkout_url;
        } else {
          throw new Error(paymentResponse.message || 'Failed to initiate shurjoPay payment.');
        }
      } else if (selectedGateway === 'SSLCommerz') {
        const response = await fetch('/api/sslcommerz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donationId: newDonationId,
            amount: donationAmount,
            customer_name: donationData.donorName,
            customer_email: donationData.donorEmail,
          }),
        });
        const paymentResponse = await response.json();
        if (paymentResponse.checkout_url) {
            window.location.href = paymentResponse.checkout_url;
        } else {
            throw new Error(paymentResponse.message || 'Failed to initiate SSLCommerz payment.');
        }
      } else {
        // Handle other gateways or direct success for manual methods
        setIsLoading(false);
        router.push(`/donations/invoice/${newDonationId}`);
      }
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      toast({
        variant: 'destructive',
        title: 'Payment Initiation Failed',
        description: error.message || 'Could not start the transaction. Please try again.',
      });
      setIsLoading(false);
      setBKashLoading(false);
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
              value={donationFrequency}
              onValueChange={(value: 'one-time' | 'monthly') => setDonationFrequency(value)}
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
                min={campaign?.minAmount ?? 0.01}
                step="0.01"
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
            {isLoading && !bKashLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <HandHeart className="mr-2 h-5 w-5" />
            )}
            {bKashLoading ? 'Processing with bKash...' : isLoading ? 'Processing...' : 'Proceed to Pay'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function DonatePage() {
    return (
        <Suspense fallback={<div className='max-w-4xl mx-auto'><Skeleton className='h-[80vh] w-full'/></div>}>
            <DonatePageContent />
        </Suspense>
    )
}
