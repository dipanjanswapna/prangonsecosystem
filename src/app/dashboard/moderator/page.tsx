import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ModeratorDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Moderator Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Content moderation and report handling.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content to Review</CardTitle>
          <CardDescription>
            Review and take action on reported content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Content moderation tools will be here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
