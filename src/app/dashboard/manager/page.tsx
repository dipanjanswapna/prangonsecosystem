import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Manager Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Oversee projects and team performance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Monitor the progress of ongoing projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Project overview and metrics will be here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
