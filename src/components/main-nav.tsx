'use client';

import {
  BookText,
  Bot,
  Briefcase,
  ChevronDown,
  Heart,
  Home,
  Library,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
    label: 'Solutions',
    children: [
      { href: '/donate', label: 'Public Sector' },
    ],
  },
  { href: '/profile', label: 'Contact Us' },
];

export function MainNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex items-center gap-x-2 text-sm font-medium text-primary-foreground/90',
        isMobile && 'flex-col items-start gap-2'
      )}
    >
      {navItems.map((item) =>
        item.children ? (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 transition-colors hover:text-primary-foreground focus:outline-none">
              <span className="mr-2">•</span>
              {item.label}
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1C1C1C] border-none text-primary-foreground">
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
              'flex items-center gap-1 px-4 py-2 transition-colors hover:text-primary-foreground',
              pathname === item.href
                ? 'text-primary-foreground'
                : 'text-primary-foreground/80'
            )}
          >
            <span className="mr-2">•</span>
            {item.label}
          </Link>
        )
      )}
    </nav>
  );
}
