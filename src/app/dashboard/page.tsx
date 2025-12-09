'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Role, ROLES, roleHierarchy } from '@/lib/roles';

// Role-specific dashboard components
function AdminDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>View, edit, and manage all users.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">User management interface will be here.</p>
      </CardContent>
    </Card>
  );
}

function ModeratorDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderator Dashboard</CardTitle>
        <CardDescription>Review and take action on reported content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Content moderation tools will be here.</p>
      </CardContent>
    </Card>
  );
}

function ManagerDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manager Dashboard</CardTitle>
        <CardDescription>Monitor the progress of ongoing projects.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Project overview and metrics will be here.</p>
      </CardContent>
    </Card>
  );
}

function CollaboratorDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaborator Dashboard</CardTitle>
        <CardDescription>Here are the tasks that require your attention.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">A list of assigned tasks will be displayed here.</p>
      </CardContent>
    </Card>
  );
}

function UserDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Dashboard</CardTitle>
        <CardDescription>View and manage your profile details.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Welcome to your personal dashboard.</p>
      </CardContent>
    </Card>
  );
}

const roleToComponent: Record<Role, React.ComponentType> = {
  [ROLES.ADMIN]: AdminDashboard,
  [ROLES.MODERATOR]: ModeratorDashboard,
  [ROLES.MANAGER]: ManagerDashboard,
  [ROLES.COLLABORATOR]: CollaboratorDashboard,
  [ROLES.USER]: UserDashboard,
};

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { data: userData, loading: roleLoading } = useDoc<{ role: Role }>(user?.uid ? `users/${user.uid}` : null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, userLoading, router]);

  const isLoading = userLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const userRole = userData?.role || ROLES.USER;
  const DashboardComponent = roleToComponent[userRole] || UserDashboard;

  const getWelcomeMessage = () => {
    switch(userRole) {
      case ROLES.ADMIN: return "Welcome, Admin. Here you can manage the entire system.";
      case ROLES.MODERATOR: return "Content moderation and report handling.";
      case ROLES.MANAGER: return "Oversee projects and team performance.";
      case ROLES.COLLABORATOR: return "View your tasks and collaborate with the team.";
      default: return "Welcome to your personal dashboard.";
    }
  }

  return (
    <div className="space-y-8">
       <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight capitalize">
          {userRole} Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {getWelcomeMessage()}
        </p>
      </div>
      <DashboardComponent />
    </div>
  );
}
