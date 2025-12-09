'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Briefcase } from "lucide-react";

export default function ManagerDashboard() {
  const projects = [
    { name: 'E-commerce Platform', progress: 75, teamSize: 5 },
    { name: 'Data Analytics Dashboard', progress: 40, teamSize: 3 },
    { name: 'SaaS Landing Page', progress: 95, teamSize: 2 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manager Dashboard</CardTitle>
          <CardDescription>
            Oversee projects, manage team assignments, and track performance metrics.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project) => (
            <div key={project.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{project.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" /> {project.teamSize}
                </div>
              </div>
              <Progress value={project.progress} />
              <p className="text-right text-sm text-muted-foreground">{project.progress}% Complete</p>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Team assignment details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
