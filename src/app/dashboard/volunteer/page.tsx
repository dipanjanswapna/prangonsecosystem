'use client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ClipboardList, MessageSquare, Calendar } from 'lucide-react';

export default function VolunteerDashboard() {
  const tasks = [
    { id: 'task1', label: 'Review new user comments', completed: true },
    {
      id: 'task2',
      label: 'Help organize the upcoming "Clean City" event',
      completed: false,
    },
    { id: 'task3', label: 'Translate blog post to Bengali', completed: false },
  ];

  const features = [
    {
      icon: ClipboardList,
      title: 'My Assigned Tasks',
      description: 'View and manage tasks assigned to you.',
    },
    {
      icon: Calendar,
      title: 'Event Calendar',
      description: 'See upcoming events and volunteer opportunities.',
    },
    {
      icon: MessageSquare,
      title: 'Community Forum',
      description: 'Engage with other volunteers and staff.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Volunteer Tasks</CardTitle>
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
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Tools</CardTitle>
              <CardDescription>
                Resources to help you in your volunteer work.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="p-3 bg-primary/10 rounded-full">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
