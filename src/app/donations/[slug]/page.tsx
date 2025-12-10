'use client';
import { notFound, useParams } from 'next/navigation';
import { campaigns, donors } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift, HandHeart, QrCode } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function CampaignDetailsPage() {
  const params = useParams<{ slug: string }>();
  const campaign = campaigns.find((c) => c.slug === params.slug);

  if (!campaign) {
    notFound();
  }

  const image = PlaceHolderImages.find((img) => img.id === campaign.imageId);
  const progress = (campaign.raised / campaign.goal) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            {image && (
              <div className="aspect-video relative">
                <Image
                  src={image.imageUrl}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                  data-ai-hint={image.imageHint}
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-headline text-3xl md:text-4xl">
                {campaign.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {campaign.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-muted-foreground">
                      <span className="font-bold text-2xl text-foreground">
                        ৳{campaign.raised.toLocaleString()}
                      </span>{' '}
                      raised
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        ৳{campaign.goal.toLocaleString()}
                      </span>{' '}
                      goal
                    </div>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="text-right text-sm mt-1 text-muted-foreground">
                    {progress.toFixed(0)}% funded
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={`/donations/${campaign.slug}/donate`}>
                        Donate Now <HandHeart className="ml-2 h-5 w-5" />
                    </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                        <Link href={`/donations/qr/${campaign.slug}`}>
                            Scan QR Code <QrCode className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About this campaign</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-full">
              <p>
                This campaign aims to address the critical need for warm clothing in remote villages during the winter season. Many families lack adequate protection against the cold, leading to health issues and hardship.
              </p>
              <p>
                Your donation will directly fund the purchase and distribution of high-quality blankets, jackets, and other winter essentials. We partner with local volunteers to ensure the aid reaches the most vulnerable individuals, including children and the elderly.
              </p>
              <h4>How Your Donation Helps:</h4>
              <ul>
                <li><strong>৳1000</strong> can provide a warm blanket for one person.</li>
                <li><strong>৳2500</strong> can supply a family with a winter kit.</li>
                <li><strong>৳10000</strong> can help us reach four families in need.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Recent Donors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {donors.map((donor, index) => {
                const donorImage = PlaceHolderImages.find(d => d.id === donor.imageId);
                return (
                <div key={index} className="flex items-center gap-4">
                  <Avatar>
                    {donorImage && <AvatarImage src={donorImage.imageUrl} alt={donor.name} />}
                    <AvatarFallback>{donor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold">{donor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Donated ৳{donor.amount}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {new Date(donor.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Badge>
                </div>
              )})}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
