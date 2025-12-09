'use client';

import { ChevronDown } from 'lucide-react';
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

const navItems = [
  { href: '/', label: 'Home' },
  {
    label: 'About Us',
    children: [
      { href: '/blog', label: 'Blog' },
      { href: '/ebooks', label: 'eBooks' },
    ],
  },
  {
    label: 'Connectivity',
    children: [
      { href: '/services', label: 'Corporate Connectivity' },
      { href: '/ai-tools', label: 'SME Connectivity' },
    ],
  },
  {
    label: 'More',
    children: [
      { href: '/donate', label: 'Public Sector' },
      { href: '/profile', label: 'Contact Us' },
    ],
  },
];

export function MainNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex items-center gap-x-1 text-sm font-medium',
        isMobile ? 'flex-col items-start gap-2' : 'text-foreground'
      )}
    >
      {navItems.map((item) =>
        item.children ? (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group flex items-center gap-1 px-4 py-2 transition-colors focus:outline-none hover:bg-transparent"
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
        ) : (
          <Link
            key={item.href}
            href={item.href!}
            className={cn(
              'group relative px-4 py-2 transition-colors hover:text-primary',
              pathname === item.href ? 'text-primary' : 'text-foreground/80'
            )}
          >
            {item.label}
            <span
              className={cn(
                'absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-300',
                pathname === item.href ? 'w-4' : 'w-0 group-hover:w-4'
              )}
            ></span>
          </Link>
        )
      )}
    </nav>
  );
}
