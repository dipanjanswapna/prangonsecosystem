import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { skills, projects } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Github } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PortfolioPage() {
  return (
    <div className="space-y-16 md:space-y-24">
      <section className="flex flex-col items-center text-center pt-8 md:pt-12">
        <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter">
          Dipanjan Das
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground font-medium">
          Full-Stack Developer, UI/UX Enthusiast, and Content Creator.
        </p>
        <p className="mt-4 max-w-xl md:max-w-2xl mx-auto text-foreground/80">
          Welcome to my digital ecosystem. Here you'll find my work, my
          thoughts, and my passion for building beautiful and functional web
          experiences.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link href="/services">
              My Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </a>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="font-headline text-3xl font-bold mb-8 text-center">
          My Skills
        </h2>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="text-sm md:text-base px-3 py-1 md:px-4 md:py-2 rounded-lg"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-headline text-3xl font-bold mb-8 text-center">
          Featured Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const image = PlaceHolderImages.find(
              (img) => img.id === project.imageId
            );
            return (
              <Card
                key={project.title}
                className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                {image && (
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={image.imageUrl}
                      alt={project.title}
                      width={600}
                      height={400}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={image.imageHint}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-headline">
                    {project.title}
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="link" className="p-0">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Project <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
