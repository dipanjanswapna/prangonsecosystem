'use client';

import { ChevronDown, LayoutDashboard, PlusCircle, Trophy, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useUser } from '@/firebase/auth/use-user';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/donations', label: 'Donations' },
  {
    label: 'More',
    children: [
      { href: '/projects', label: 'Projects' },
      { href: '/portfolio', label: 'Portfolio' },
      { href: '/services', label: 'Services' },
      { href: '/blog', label: 'Blog' },
      { href: '/library', label: 'eBook Library' },
      { href: '/donor-wall', label: 'Donor Wall' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/whats-new', label: "What's New" },
    ],
  },
];

export function MainNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { user } = useUser();

  const renderNavItem = (item: (typeof navItems)[0]) => {
    const isActive =
      (item.href && pathname === item.href) ||
      (item.children && item.children.some((child) => pathname === child.href));

    if (item.children) {
      return (
        <DropdownMenu key={item.label}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'group flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors focus:outline-none hover:bg-transparent hover:text-primary',
                isActive ? 'text-primary' : 'text-foreground/80',
                isMobile ? 'w-full justify-start text-base' : ''
              )}
            >
              <span className="group-hover:text-primary transition-colors duration-300">
                {item.label}
              </span>
              <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {item.children.map((child) => (
              <DropdownMenuItem key={child.href} asChild>
                <Link href={child.href}>{child.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href!}
        className={cn(
          'group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
          pathname === item.href ? 'text-primary' : 'text-foreground/80',
          isMobile ? 'w-full text-base' : ''
        )}
      >
        {item.label}
        {!isMobile && (
          <span
            className={cn(
              'absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-300',
              pathname === item.href ? 'w-4' : 'w-0 group-hover:w-4'
            )}
          ></span>
        )}
      </Link>
    );
  };

  return (
    <nav
      className={cn(
        'flex items-center gap-x-1',
        isMobile ? 'flex-col items-start gap-y-2' : 'text-foreground'
      )}
    >
      {navItems.map(renderNavItem)}
      <Link
        href="/blood-donation"
        className={cn(
            'group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center gap-1',
            pathname === '/blood-donation' ? 'text-primary' : 'text-foreground/80',
            isMobile ? 'w-full text-base' : ''
        )}
        >
        <HeartHandshake className="h-4 w-4" />
        Blood Donation
        {!isMobile && (
            <span
            className={cn(
                'absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-300',
                pathname === '/blood-donation' ? 'w-4' : 'w-0 group-hover:w-4'
            )}
            ></span>
        )}
      </Link>
      <Link
        href="/leaderboard"
        className={cn(
            'group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center gap-1',
            pathname === '/leaderboard' ? 'text-primary' : 'text-foreground/80',
            isMobile ? 'w-full text-base' : ''
        )}
        >
        <Trophy className="h-4 w-4" />
        Leaderboard
        {!isMobile && (
            <span
            className={cn(
                'absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-300',
                pathname === '/leaderboard' ? 'w-4' : 'w-0 group-hover:w-4'
            )}
            ></span>
        )}
        </Link>
       {user && isMobile && (
        <Link
          href="/dashboard"
          className={cn(
            'group relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
            pathname.startsWith('/dashboard') ? 'text-primary' : 'text-foreground/80',
            isMobile ? 'w-full text-base' : ''
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      )}
    </nav>
  );
}
