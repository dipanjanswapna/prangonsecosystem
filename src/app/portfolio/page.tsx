import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const portfolioItems = [
    {
      id: 'portfolio-1',
      title: 'Behance Project 1',
      description: 'A UI/UX case study for a mobile banking app.',
      imageId: 'project-1',
      link: '#',
    },
    {
      id: 'portfolio-2',
      title: 'Behance Project 2',
      description: 'Website redesign for a non-profit organization.',
      imageId: 'project-2',
      link: '#',
    },
    {
      id: 'portfolio-3',
      title: 'UI/UX Work 1',
      description: 'Dashboard design for a data analytics platform.',
      imageId: 'project-3',
      link: '#',
    },
    {
        id: 'portfolio-4',
        title: 'UI/UX Work 2',
        description: 'Landing page UI for a new SaaS product.',
        imageId: 'blog-1',
        link: '#',
    },
    {
        id: 'portfolio-5',
        title: 'Personal Design Project',
        description: 'A concept for a travel planning application.',
        imageId: 'blog-2',
        link: '#',
    },
    {
        id: 'portfolio-6',
        title: 'Freelance Design Work',
        description: 'Branding and identity for a local coffee shop.',
        imageId: 'blog-3',
        link: '#',
    }
  ];

export default function PortfolioPage() {
  return (
    <div className="space-y-8">
      <div className="text-center px-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Design Portfolio
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          A glimpse into my world of UI/UX design, from Behance showcases to freelance projects.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {portfolioItems.map((item) => {
          const image = PlaceHolderImages.find((img) => img.id === item.imageId);
          return (
            <Card key={item.id} className="group overflow-hidden relative">
              {image && (
                <Image
                  src={image.imageUrl}
                  alt={item.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  data-ai-hint={image.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <CardContent className="absolute bottom-0 left-0 p-6">
                <h3 className="font-headline text-xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-white/90 text-sm mb-4">{item.description}</p>
                <Button asChild variant="secondary" size="sm">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    View on Behance <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
