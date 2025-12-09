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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/', label: 'Portfolio', icon: Home },
  { href: '/blog', label: 'Blog', icon: BookText },
  { href: '/ebooks', label: 'eBooks', icon: Library },
  { href: '/services', label: 'Services', icon: Briefcase },
  { href: '/donate', label: 'Donate', icon: Heart },
  { href: '/ai-tools', label: 'AI Tools', icon: Bot },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
