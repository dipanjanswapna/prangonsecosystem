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
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );
  
  const onSelect = React.useCallback((api: CarouselApi) => {
    setCurrent(api.selectedScrollSnap())
  }, [])

  const scrollTo = React.useCallback(
    (index: number) => api && api.scrollTo(index),
    [api]
  )

  React.useEffect(() => {
    if (!api) {
      return;
    }
    
    onSelect(api);
    setScrollSnaps(api.scrollSnapList());
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    
  }, [api, onSelect]);

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
            const isCenter = current === index;
            return (
              <CarouselItem
                key={index}
                className={cn(
                  'pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-3/5 transition-transform duration-300 ease-in-out',
                  isCenter ? 'scale-100' : 'scale-75 opacity-60'
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
       <div className="flex justify-center gap-2 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-300',
                current === index ? 'w-4 bg-primary' : 'bg-muted-foreground/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
    </section>
  );
}
