'use client';
import { notFound, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';
import Image from 'next/image';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';

interface Campaign {
  id: string;
  title: string;
  slug: string;
}

const QRPageSkeleton = () => (
  <div className="max-w-md mx-auto">
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-fit mb-4">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full mx-auto mt-2" />
        <Skeleton className="h-4 w-5/6 mx-auto mt-1" />
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <Skeleton className="h-64 w-64" />
        <Skeleton className="h-12 w-48" />
      </CardContent>
    </Card>
  </div>
);

export default function CampaignQRPage() {
  const params = useParams<{ slug: string }>();
  const { data: campaigns, loading } = useCollection<Campaign>(
    'campaigns',
    'slug',
    params.slug
  );
  const campaign = campaigns[0];

  if (loading) {
    return <QRPageSkeleton />;
  }

  if (!campaign) {
    notFound();
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${process.env.NEXT_PUBLIC_BASE_URL}/donations/${campaign.slug}/donate`;

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary w-fit p-4 rounded-full mb-4">
            <QrCode className="h-10 w-10" />
          </div>
          <CardTitle className="font-headline text-2xl">
            QR Code for: {campaign.title}
          </CardTitle>
          <CardDescription>
            Scan this QR code with your mobile device to go directly to the
            donation page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="p-4 border rounded-lg bg-white">
            <Image
              src={qrCodeUrl}
              alt={`QR Code for ${campaign.title}`}
              width={256}
              height={256}
              className="object-contain"
              priority
            />
          </div>
          <Button asChild size="lg">
            <a href={qrCodeUrl} download={`qr-code-${campaign.slug}.png`}>
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
