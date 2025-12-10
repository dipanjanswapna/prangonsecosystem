import { notFound } from 'next/navigation';
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
import { HandHeart } from 'lucide-react';
import Image from 'next/image';

function GatewayIcon({ name, src }: { name: string; src: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Image src={src} alt={name} width={80} height={80} className="object-contain rounded-md" />
    </div>
  );
}

export default function DonatePage({ params }: { params: { slug: string } }) {
  const campaign = campaigns.find((c) => c.slug === params.slug);

  if (!campaign) {
    notFound();
  }
  
  const suggestedAmounts = [10, 25, 50, 100];

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
            <Label htmlFor="amount" className="text-lg font-medium">Choose an amount (BDT)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestedAmounts.map(amount => (
                <Button key={amount} variant="outline" size="lg" className="h-16 text-xl">
                  ৳{amount}
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
                min="1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <Label className="text-lg font-medium">Your Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="name">Full Name</Label>
                 <Input id="name" placeholder="e.g., John Doe" />
               </div>
                <div className="space-y-2">
                 <Label htmlFor="email">Email Address</Label>
                 <Input id="email" type="email" placeholder="e.g., john.doe@example.com" />
               </div>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="anonymous" />
                <Label htmlFor="anonymous" className="text-sm font-normal">
                    Make my donation anonymous
                </Label>
            </div>
          </div>
          
          <div className="space-y-4">
             <Label className="text-lg font-medium">Select Payment Method</Label>
             <div className="grid grid-cols-3 md:grid-cols-5 gap-4 items-center justify-items-center">
                <GatewayIcon name="bKash" src="https://i.ibb.co/609yv0N/bkash.png" />
                <GatewayIcon name="Nagad" src="https://i.ibb.co/qMs2N1x/nagad.png" />
                <GatewayIcon name="Rocket" src="https://i.ibb.co/mX1x12s/rocket.png" />
                <GatewayIcon name="SSLCommerz" src="https://i.ibb.co/fCwH1s9/sslcommerz.png" />
                <GatewayIcon name="SurjoPay" src="https://i.ibb.co/3s6K3h7/surjopay.png" />
             </div>
          </div>

        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full text-lg">
            Proceed to Pay <HandHeart className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
