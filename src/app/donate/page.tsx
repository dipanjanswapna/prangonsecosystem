import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { donors } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart } from 'lucide-react';

export default function DonatePage() {
  const goal = 5000;
  const raised = donors.reduce((acc, donor) => acc + donor.amount, 0);
  const progress = (raised / goal) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-2 space-y-8">
        <div className="text-center lg:text-left">
          <h1 className="font-headline text-4xl font-bold tracking-tight">
            Support ONGON Bangladesh
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your contribution makes a difference. Help us empower communities.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Make a Donation</CardTitle>
            <CardDescription>
              Every donation, big or small, brings us closer to our goal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Donation Progress</Label>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${raised.toLocaleString()} raised</span>
                <span>${goal.toLocaleString()} goal</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[25, 50, 100, 250].map((amount) => (
                <Button key={amount} variant="outline" size="lg">
                  ${amount}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-amount">Or enter a custom amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">$</span>
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="5.00"
                  className="text-lg"
                />
              </div>
            </div>

            <Button size="lg" className="w-full">
              <Heart className="mr-2 h-5 w-5" />
              Donate Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="font-headline text-2xl font-bold text-center lg:text-left">
          Donor Wall
        </h2>
        <div className="space-y-4">
          {donors.map((donor, index) => {
            const image = PlaceHolderImages.find(
              (img) => img.id === donor.imageId
            );
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-card rounded-lg"
              >
                <Avatar>
                  {image && (
                    <AvatarImage
                      src={image.imageUrl}
                      alt={donor.name}
                      data-ai-hint={image.imageHint}
                    />
                  )}
                  <AvatarFallback>
                    {donor.name.charAt(0)}
                    {donor.name.split(' ')[1]?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-semibold">{donor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    donated ${donor.amount}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {donor.date}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
