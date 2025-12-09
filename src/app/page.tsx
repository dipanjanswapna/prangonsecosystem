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

function WavyBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-1/2 w-full">
        <svg
          className="h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 150"
        >
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                stopColor="hsla(var(--primary) / 0.2)"
                stopOpacity="0.5"
              />
              <stop
                offset="100%"
                stopColor="hsla(var(--accent) / 0.2)"
                stopOpacity="0.5"
              />
            </linearGradient>
          </defs>
          <path
            fill="none"
            stroke="url(#wave-gradient)"
            strokeWidth="2"
            d="M-200,100 C-100,20 100,180 200,100 S400,20 500,100 S700,180 800,100 S1000,20 1100,100 S1300,180 1400,100 S1600,20 1700,100"
          />
          <path
            fill="none"
            stroke="url(#wave-gradient)"
            strokeWidth="2"
            d="M-200,80 C-100,0 100,160 200,80 S400,0 500,80 S700,160 800,80 S1000,0 1100,80 S1300,160 1400,80 S1600,0 1700,80"
          />
          <path
            fill="none"
            stroke="url(#wave-gradient)"
            strokeWidth="1"
            d="M-200,120 C-100,40 100,200 200,120 S400,40 500,120 S700,200 800,120 S1000,40 1100,120 S1300,200 1400,120 S1600,40 1700,120"
          />
        </svg>
      </div>
    </div>
  );
}

function CTASection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-background py-20 md:py-28">
      <div className="container relative z-10 text-center">
        <p className="font-headline text-sm font-medium uppercase tracking-widest text-primary">
          Discover
        </p>
        <h2 className="mt-4 font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          How Our Solutions Can <br /> Elevate Your Success
        </h2>
        <div className="mt-8">
          <Button asChild variant="outline" size="lg">
            <Link href="/profile">
              Contact With Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <WavyBackground />
    </section>
  );
}


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
      <CTASection />
    </div>
  );
}
