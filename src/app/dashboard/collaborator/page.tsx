'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function CollaboratorDashboard() {
  const tasks = [
    { id: 'task1', label: 'Design new landing page mockups', completed: false },
    { id: 'task2', label: 'Develop API endpoints for user authentication', completed: true },
    { id: 'task3', label: 'Write documentation for the new feature', completed: false },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Collaborator Dashboard</CardTitle>
          <CardDescription>
            Access your assigned tasks, upload files, and provide feedback.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-3">
              <Checkbox id={task.id} checked={task.completed} />
              <label
                htmlFor={task.id}
                className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}
              >
                {task.label}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Upload project assets and documents here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" />
            </label>
          </div> 
        </CardContent>
      </Card>
    </div>
  );
}
