'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Book, BrainCircuit, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
  const learningTools = [
    {
      title: 'eBook Library',
      description: 'Access our collection of eBooks and resources.',
      icon: Book,
      href: '/library',
    },
    {
      title: 'AI Content Tools',
      description: 'Generate outlines and drafts for your content.',
      icon: BrainCircuit,
      href: '/ai-tools',
    },
    {
      title: 'GPA Calculator',
      description: 'Calculate your GPA and track your academic progress.',
      icon: Calculator,
      href: '#',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Dashboard</CardTitle>
          <CardDescription>
            Welcome back! Here are your learning tools and notifications.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Learning Tools</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {learningTools.map((tool) => (
            <Card key={tool.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  {tool.title}
                </CardTitle>
                <tool.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {tool.description}
                </p>
              </CardContent>
              <CardContent>
                <Button asChild>
                  <Link href={tool.href}>Open Tool</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
