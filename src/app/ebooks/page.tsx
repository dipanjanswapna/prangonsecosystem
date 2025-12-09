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
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          eBook Library
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A collection of resources to help you learn and grow.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {ebooks.map((ebook) => {
          const image = PlaceHolderImages.find(
            (img) => img.id === ebook.imageId
          );
          return (
            <Card
              key={ebook.title}
              className="flex flex-col overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20"
            >
              {image && (
                <div className="bg-muted aspect-[3/4] overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={ebook.title}
                    width={300}
                    height={400}
                    className="object-cover w-full h-full"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              )}
              <CardHeader className="flex-grow">
                <CardTitle className="font-headline text-lg">
                  {ebook.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {ebook.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
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
