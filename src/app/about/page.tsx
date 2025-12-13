import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BookOpen,
  BrainCircuit,
  Lightbulb,
  Briefcase,
  Users,
  Check,
} from 'lucide-react';

export default function AboutPage() {
  const pillars = [
    {
      icon: BookOpen,
      title: 'Education & Learning',
      points: [
        'Online learning platforms (e.g., Dreamer’s Learniogram – DreL)',
        'HSC, SSC, admission & concept-based academic content',
        'Student-friendly explanations and mentorship',
        'Free + affordable quality education',
      ],
    },
    {
      icon: BrainCircuit,
      title: 'Technology & Digital Products',
      points: [
        'Educational web apps & LMS platforms',
        'Student dashboards, admin panels, teacher portals',
        'AI-assisted learning tools',
        'Web development using Firebase, Vercel, GitHub',
      ],
    },
    {
      icon: Lightbulb,
      title: 'Creative & Media Platform',
      points: [
        'Educational YouTube & Facebook content',
        'Motivational storytelling for students',
        'Graphic design & UI/UX work',
        'Personal branding and digital presence',
      ],
    },
    {
      icon: Briefcase,
      title: 'Freelancing & Skill Development',
      points: [
        'Training students in graphic design, web development, and digital tools',
        'Helping youth enter freelancing marketplaces',
        'Building real-world portfolios',
      ],
    },
    {
      icon: Users,
      title: 'Social Impact & Community',
      points: [
        'Collaboration with organizations like ONGON Bangladesh',
        'Donation systems & humanitarian projects',
        'Youth leadership and volunteer engagement',
        'Ethical, non-political service initiatives',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <p className="font-headline text-primary">Prangon’s Ecosystem</p>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">
          About Us
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          A youth-led, innovation-driven ecosystem founded by Dipanjan Swapna
          Prangon. It is designed to connect education, technology, creativity,
          and social impact under one integrated platform.
        </p>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="font-headline text-center">
            Our Core Vision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg">
            To build future-ready learners and creators by providing quality
            education, practical digital skills, creative platforms, and a
            strong sense of ethical and social responsibility.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">
          Key Pillars of the Ecosystem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <pillar.icon className="h-8 w-8 text-primary" />
                  <span>{pillar.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {pillar.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-1 shrink-0 text-green-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-center">
            In One Line
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg font-semibold italic">
           Prangon’s Ecosystem is a unified platform where learning, technology, creativity, and social responsibility grow together to shape future leaders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
