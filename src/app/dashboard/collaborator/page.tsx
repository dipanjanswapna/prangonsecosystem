'use client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Upload,
  ClipboardCheck,
  MessageSquare,
  File,
  Video,
  Calendar,
  BarChart2,
  Settings,
  DollarSign,
  Briefcase,
  Users,
  Lightbulb,
  Book,
  ClipboardList,
  Archive,
  Edit,
  Trash2,
  Copy,
  Link as LinkIcon,
  Share2,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function CollaboratorDashboard() {
  const tasks = [
    { id: 'task1', label: 'Design new landing page mockups', completed: false },
    {
      id: 'task2',
      label: 'Develop API endpoints for user authentication',
      completed: true,
    },
    { id: 'task3', label: 'Write documentation for the new feature', completed: false },
    { id: 'task4', label: 'Review translations for the Spanish site', completed: false },
  ];

  const features = [
    // Project Management
    {
      icon: Briefcase,
      title: 'Project Overview',
      description: 'See all projects you are a part of.',
    },
    {
      icon: ClipboardList,
      title: 'Task Boards',
      description: 'Manage your tasks using Kanban boards.',
    },
    {
      icon: Calendar,
      title: 'Project Calendar',
      description: 'View deadlines and milestones.',
    },
    {
      icon: BarChart2,
      title: 'Your Contribution',
      description: 'Track your contributions and progress.',
    },
    // Communication
    {
      icon: MessageSquare,
      title: 'Team Chat',
      description: 'Real-time communication with your team.',
    },
    {
      icon: Video,
      title: 'Video Meetings',
      description: 'Start or join video calls.',
    },
    // File & Asset Management
    {
      icon: File,
      title: 'File Repository',
      description: 'Access all project-related files.',
    },
    {
      icon: Archive,
      title: 'Asset Library',
      description: 'Manage brand assets and media.',
    },
    {
      icon: Edit,
      title: 'Document Editor',
      description: 'Collaborate on documents in real-time.',
    },
    {
      icon: Trash2,
      title: 'Recycle Bin',
      description: 'Restore deleted files and assets.',
    },
     // Productivity Tools
    {
      icon: Lightbulb,
      title: 'Idea Board',
      description: 'Brainstorm and share ideas with the team.',
    },
    {
      icon: Book,
      title: 'Knowledge Base',
      description: 'Access tutorials and documentation.',
    },
    {
      icon: DollarSign,
      title: 'Expense Tracking',
      description: 'Log and track project-related expenses.',
    },
    {
      icon: Settings,
      title: 'Workspace Settings',
      description: 'Customize your workspace and notifications.',
    },
    // Content Tools
    {
      icon: Edit,
      title: 'Content Planner',
      description: 'Plan and schedule content releases.',
    },
    {
      icon: Copy,
      title: 'Version History',
      description: 'Track changes and revert to previous versions.',
    },
    {
      icon: LinkIcon,
      title: 'Shared Links',
      description: 'Create and manage shareable links for assets.',
    },
     {
      icon: Share2,
      title: 'Social Sharing',
      description: 'Directly share content to social media platforms.',
    },
    {
      icon: Users,
      title: 'Feedback Panel',
      description: 'Request and manage feedback from stakeholders.',
    },
    {
      icon: ClipboardCheck,
      title: 'Approval Workflows',
      description: 'Submit your work for formal approval.',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Collaborator Dashboard</CardTitle>
          <CardDescription>
            Welcome! Here are your tools and tasks to help you contribute
            effectively.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <Checkbox id={task.id} checked={task.completed} />
                  <label
                    htmlFor={task.id}
                    className={`text-sm font-medium ${
                      task.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.label}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>My Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Tasks Completed</span>
                            <span className="text-sm font-medium">5 / 12</span>
                        </div>
                        <Progress value={ (5/12) * 100 } />
                    </div>
                     <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Project Alpha</span>
                            <span className="text-sm font-medium">75%</span>
                        </div>
                        <Progress value={75} />
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>My Tools</CardTitle>
                    <CardDescription>All the tools you need for your creative workflow.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {features.map((feature) => (
                        <div key={feature.title} className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                            <div className="p-3 bg-primary/10 rounded-full mb-2">
                               <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-semibold">{feature.title}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
