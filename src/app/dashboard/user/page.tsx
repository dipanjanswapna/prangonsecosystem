import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function UserDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          My Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Welcome to your personal dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>
            View and manage your profile details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Profile information and settings will be here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
