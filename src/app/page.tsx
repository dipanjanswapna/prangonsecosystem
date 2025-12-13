'use client'

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { skills } from '@/lib/placeholder-data';
import { AlertTriangle, ArrowRight, Github, Siren, Book, BrainCircuit, Users, Briefcase, DollarSign, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { HeroCarousel } from '@/components/hero-carousel';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';

interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  urgencyLevel: 'Normal' | 'Urgent' | 'Critical';
  status: 'pending' | 'fulfilled' | 'closed';
}

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
            <Link href="/contact">
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

function EmergencyBanner() {
    const { data: criticalRequests, loading } = useCollection<BloodRequest>(
    'bloodRequests',
    undefined,
    undefined,
    undefined,
    1,
    [
      ['urgencyLevel', '==', 'Critical'],
      ['status', '==', 'pending'],
    ]
  );

  const emergencyRequest = criticalRequests?.[0];

    if (loading) {
        return (
            <Skeleton className="h-36 w-full mb-8" />
        )
    }

    if (!emergencyRequest) {
        return null;
    }

    return (
        <div className="relative bg-red-600 text-white rounded-lg p-6 mb-8 overflow-hidden">
            <div className="absolute -bottom-4 -right-4">
                <Siren className="h-32 w-32 text-white/10" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl font-headline">CRITICAL BLOOD REQUEST: {emergencyRequest.bloodGroup} Needed</h3>
                        <p className="text-white/90 max-w-2xl">A patient named {emergencyRequest.patientName} urgently needs your help. Please respond immediately.</p>
                    </div>
                </div>
                <Button asChild variant="secondary" size="lg" className="shrink-0">
                    <Link href={`/blood-donation/requests/${emergencyRequest.id}`}>
                        View Details & Respond
                    </Link>
                </Button>
            </div>
        </div>
    );
}


export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24">
      <div className="grid grid-cols-1 items-start gap-8 md:gap-12 lg:grid-cols-2">
        <section className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-4">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter">
            Prangon’s Ecosystem
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            A youth-led, innovation-driven ecosystem founded by Dipanjan Swapna Prangon. It is designed to connect education, technology, creativity, and social impact under one integrated platform.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/services">
                Explore Services
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
        <HeroCarousel />
      </div>
      
      <EmergencyBanner />

      <section className="text-center">
        <h2 className="font-headline text-3xl font-bold mb-4 text-center">
          Featured Projects
        </h2>
        <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
          I've had the privilege of working on a diverse range of projects. Here are a few highlights. For a more comprehensive list, please visit my projects page.
        </p>
        <Button asChild size="lg">
            <Link href="/projects">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
      </section>
      
      <section>
        <h2 className="font-headline text-3xl font-bold mb-8 text-center">
          🧩 Key Pillars of Prangon’s Ecosystem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg">
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2"><Book/> Education & Learning</h4>
                <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    <li>Online learning platforms (e.g., Dreamer’s Learniogram – DreL)</li>
                    <li>HSC, SSC, admission & concept-based academic content</li>
                    <li>Student-friendly explanations and mentorship</li>
                    <li>Free + affordable quality education</li>
                </ul>
            </div>
            <div className="p-6 border rounded-lg">
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2"><BrainCircuit/> Technology & Digital Products</h4>
                 <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    <li>Educational web apps & LMS platforms</li>
                    <li>Student dashboards, admin panels, teacher portals</li>
                    <li>AI-assisted learning tools</li>
                    <li>Web development using Firebase, Vercel, GitHub</li>
                </ul>
            </div>
            <div className="p-6 border rounded-lg">
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2"><Lightbulb/> Creative & Media Platform</h4>
                 <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    <li>Educational YouTube & Facebook content</li>
                    <li>Motivational storytelling for students</li>
                    <li>Graphic design & UI/UX work</li>
                    <li>Personal branding and digital presence</li>
                </ul>
            </div>
            <div className="p-6 border rounded-lg">
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2"><Briefcase/> Freelancing & Skill Development</h4>
                 <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    <li>Training students in:</li>
                    <li>Graphic design</li>
                    <li>Web development</li>
                    <li>Digital tools</li>
                    <li>Helping youth enter freelancing marketplaces</li>
                    <li>Building real-world portfolios</li>
                </ul>
            </div>
             <div className="p-6 border rounded-lg">
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2"><Users/> Social Impact & Community</h4>
                 <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    <li>Collaboration with organizations like ONGON Bangladesh</li>
                    <li>Donation systems & humanitarian projects</li>
                    <li>Youth leadership and volunteer engagement</li>
                    <li>Ethical, non-political service initiatives</li>
                </ul>
            </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
