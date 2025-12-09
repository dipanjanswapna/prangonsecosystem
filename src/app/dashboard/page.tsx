import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FirstDraftForm } from '../ai-tools/first-draft-form';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="px-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Welcome back, Dipanjan. Here are your content generation tools.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>AI Content Tools</CardTitle>
                <CardDescription>Quickly generate content using AI.</CardDescription>
            </CardHeader>
            <CardContent>
                <FirstDraftForm />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>An overview of your recent actions.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No recent activity.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
