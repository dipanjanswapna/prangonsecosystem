'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';

const carouselItems = [
  'carousel-1',
  'carousel-2',
  'carousel-3',
  'carousel-4',
  'carousel-5',
];

export function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );
  
  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);


  return (
    <section className="w-full">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,
          align: 'center',
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {carouselItems.map((id, index) => {
            const image = PlaceHolderImages.find((img) => img.id === id);
            return (
              <CarouselItem
                key={index}
                className={cn(
                  'pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-3/5 transition-transform duration-300 ease-in-out'
                )}
              >
                <div className="p-1">
                  <div className="relative aspect-video overflow-hidden rounded-lg shadow-lg group">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
       <div className="text-center mt-4 font-mono text-sm text-muted-foreground">
          {String(current).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </div>
    </section>
  );
}
