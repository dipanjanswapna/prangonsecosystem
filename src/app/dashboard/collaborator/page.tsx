import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CollaboratorDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Collaborator Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          View your tasks and collaborate with the team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
          <CardDescription>
            Here are the tasks that require your attention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A list of assigned tasks will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
