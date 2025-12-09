import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Welcome, Admin. Here you can manage the entire system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View, edit, and manage all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            User management interface will be here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
