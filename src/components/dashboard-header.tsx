'use client';

import {
  Bell,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { UserNav } from './user-nav';
import { usePathname } from 'next/navigation';


function getBreadcrumb(pathname: string) {
    if (pathname.includes('/dashboard/admin/blood-requests')) return 'Blood Requests';
    if (pathname.includes('/dashboard/admin/volunteers')) return 'Volunteers';
    if (pathname.includes('/dashboard/admin/campaigns')) return 'Campaigns';
    if (pathname.includes('/dashboard/admin/reports')) return 'Reports';
    if (pathname.includes('/dashboard/admin/donations')) return 'Donations';
    if (pathname.includes('/dashboard/admin/subscriptions')) return 'Subscriptions';
    if (pathname.includes('/dashboard/admin')) return 'Admin';
    if (pathname.includes('/dashboard/all-users')) return 'All Users';
    if (pathname.includes('/dashboard/moderator')) return 'Moderator';
    if (pathname.includes('/dashboard/manager')) return 'Manager';
    if (pathname.includes('/dashboard/collaborator')) return 'Collaborator';
    if (pathname.includes('/dashboard/user/donations')) return 'My Donations';
    if (pathname.includes('/dashboard/user/subscriptions')) return 'My Subscriptions';
    if (pathname.includes('/dashboard/user/blood-requests')) return 'My Blood Requests';
    if (pathname.includes('/dashboard/user/referrals')) return 'My Referrals';
    if (pathname.includes('/dashboard/user/responses')) return 'My Responses';
    if (pathname.includes('/dashboard/user')) return 'My Dashboard';
    if (pathname.includes('/auth/profile')) return 'Profile';
    if (pathname.includes('/auth/update-profile')) return 'Update Profile';
    return 'Overview'
}

export function DashboardHeader() {
    const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="relative flex-1">
        <h1 className="text-xl font-semibold">{getBreadcrumb(pathname)}</h1>
      </div>
      <div className="relative ml-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
      <UserNav />
    </header>
  );
}
