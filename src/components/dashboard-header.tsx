'use client';

import * as React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { UserNav } from './user-nav';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from './ui/breadcrumb';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

function getBreadcrumbs(pathname: string) {
  const pathParts = pathname.split('/').filter((part) => part);
  const breadcrumbs: { href: string; label: string }[] = [];

  if (pathParts[0] !== 'dashboard') return [];

  breadcrumbs.push({ href: '/dashboard', label: 'Dashboard' });

  if (pathParts[1] === 'admin')
    breadcrumbs.push({ href: '/dashboard/admin', label: 'Admin' });
  else if (pathParts[1] === 'user')
    breadcrumbs.push({ href: '/dashboard/user', label: 'User' });

  if (pathParts[2]) {
    const label = pathParts[2]
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    breadcrumbs.push({
      href: `/dashboard/${pathParts[1]}/${pathParts[2]}`,
      label: label,
    });
  }
  if (pathParts[3] && pathParts[3] !== 'edit' && pathParts[3] !== 'new') {
    breadcrumbs.push({
      href: `/dashboard/${pathParts[1]}/${pathParts[2]}/${pathParts[3]}`,
      label: 'Details',
    });
  }
  if (pathParts[4] === 'edit') {
    breadcrumbs.push({ href: `#`, label: 'Edit' });
  }

  return breadcrumbs;
}

export function DashboardHeader({
  onMobileMenuClick,
}: {
  onMobileMenuClick: () => void;
}) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button
        variant="outline"
        size="icon"
        className="sm:hidden"
        onClick={onMobileMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <ThemeToggle />
      <UserNav />
    </header>
  );
}
