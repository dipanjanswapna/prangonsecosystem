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
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
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
              className="flex flex-col overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20"
            >
              {image && (
                <div className="aspect-video overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline text-xl">
                  {post.title}
                </CardTitle>
                <CardDescription>{post.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
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
