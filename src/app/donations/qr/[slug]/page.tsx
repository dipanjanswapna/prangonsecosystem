import { notFound } from 'next/navigation';
import { campaigns } from '@/lib/placeholder-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';
import Image from 'next/image';

export default function CampaignQRPage({ params }: { params: { slug: string } }) {
  const campaign = campaigns.find((c) => c.slug === params.slug);

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
            Scan this QR code with your mobile device to go directly to the donation page.
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
