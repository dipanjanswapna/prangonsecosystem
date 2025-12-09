import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { blogPosts } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function BlogPage() {
  return (
    <div className="space-y-8">
      <div className="text-center px-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Blog & Articles
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Educational and motivational content from my journey in tech and
          design.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPosts.map((post) => {
          const image = PlaceHolderImages.find(
            (img) => img.id === post.imageId
          );
          return (
            <Card
              key={post.title}
              className="flex flex-col overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              {image && (
                <div className="aspect-video overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription>{post.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <span>{post.author}</span>
                <span className="mx-2">•</span>
                <span>{post.date}</span>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
