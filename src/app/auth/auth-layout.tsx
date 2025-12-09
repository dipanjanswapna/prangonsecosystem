import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import * as React from 'react';

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const adImage = PlaceHolderImages.find((img) => img.id === 'auth-ad');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center min-h-[calc(100vh-10rem)]">
      <div className="lg:col-span-3 flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold font-headline">{title}</h1>
            <p className="text-balance text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
      <div className="lg:col-span-2 h-full flex items-center justify-center relative p-10 flex-col gap-8 rounded-2xl bg-muted overflow-hidden">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">Advertisement</h2>
          {adImage && (
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Image
                src={adImage.imageUrl}
                alt="Advertisement"
                width="400"
                height="600"
                className="object-cover rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                data-ai-hint={adImage.imageHint}
              />
            </a>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Your ad could be here. Contact us for more info.
          </p>
        </div>
      </div>
    </div>
  );
}
