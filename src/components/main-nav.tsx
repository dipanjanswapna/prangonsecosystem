'use client';

import {
  BookText,
  Bot,
  Briefcase,
  Heart,
  Home,
  Library,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Portfolio', icon: Home },
  { href: '/blog', label: 'Blog', icon: BookText },
  { href: '/ebooks', label: 'eBooks', icon: Library },
  { href: '/services', label: 'Services', icon: Briefcase },
  { href: '/donate', label: 'Donate', icon: Heart },
  { href: '/ai-tools', label: 'AI Tools', icon: Bot },
];

export function MainNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex items-center gap-4 text-sm font-medium',
        isMobile && 'flex-col items-start gap-2'
      )}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors hover:text-primary',
            pathname === item.href ? 'text-foreground' : 'text-muted-foreground',
            isMobile && 'flex items-center gap-3 rounded-md p-2 text-base'
          )}
        >
          {isMobile && <item.icon className="h-5 w-5" />}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
