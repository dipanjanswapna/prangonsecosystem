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
  const authImage = PlaceHolderImages.find(
    (img) => img.id === 'auth-illustration'
  );

  return (
    <div className="min-h-[calc(100vh-10rem)] w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold font-headline">{title}</h1>
            <p className="text-balance text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center relative p-10 flex-col gap-8 rounded-2xl" style={{backgroundImage: 'linear-gradient(to bottom right, #f0abfc, #a855f7, #4c1d95)'}}>
        {authImage && (
          <Image
            src={authImage.imageUrl}
            alt="Auth Illustration"
            width="800"
            height="600"
            className="object-contain"
            data-ai-hint={authImage.imageHint}
          />
        )}
        <div className="text-center text-white">
            <h2 className="text-2xl font-bold font-headline">ASG Shop CRM</h2>
            <p>Sales Dashboard of ASG Shop</p>
            <p className="text-sm mt-4 opacity-80">© 2021-22 Apar's Classroom</p>
        </div>
      </div>
    </div>
  );
}
