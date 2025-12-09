import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ebooks } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function EbooksPage() {
  return (
    <div className="space-y-8">
      <div className="text-center px-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          eBook Library
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A collection of resources to help you learn and grow.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {ebooks.map((ebook) => {
          const image = PlaceHolderImages.find(
            (img) => img.id === ebook.imageId
          );
          return (
            <Card
              key={ebook.title}
              className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              {image && (
                <div className="bg-muted aspect-[3/4] overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={ebook.title}
                    width={300}
                    height={400}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              )}
              <CardHeader className="flex-grow p-4">
                <CardTitle className="font-headline text-base md:text-lg leading-tight">
                  {ebook.title}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm pt-1">
                  {ebook.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={ebook.downloadLink}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
