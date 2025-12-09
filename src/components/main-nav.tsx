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
        'flex items-center gap-x-1 text-sm font-medium text-primary-foreground/90',
        isMobile && 'flex-col items-start gap-2'
      )}
    >
      {navItems.map((item) =>
        item.children ? (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger className="group flex items-center gap-1 px-4 py-2 transition-colors focus:outline-none">
              <span className="group-hover:text-primary-foreground transition-colors duration-300">{item.label}</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gradient-to-r from-purple-700 via-purple-600 to-blue-600 border-none text-primary-foreground">
              {item.children.map((child) => (
                <DropdownMenuItem key={child.href} asChild className="hover:bg-primary-foreground/10 focus:bg-primary-foreground/10">
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
              'relative px-4 py-2 transition-colors hover:text-primary-foreground',
              pathname === item.href
                ? 'text-primary-foreground'
                : 'text-primary-foreground/80'
            )}
          >
            {item.label}
            {pathname === item.href && (
               <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-primary-foreground rounded-full"></span>
            )}
             <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-4 bg-primary-foreground rounded-full transition-all duration-300"></span>
          </Link>
        )
      )}
    </nav>
  );
}
