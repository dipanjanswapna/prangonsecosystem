'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {
  LogIn,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  CreditCard,
  LifeBuoy,
  Settings,
  Mail,
  MessageSquare,
  PlusCircle,
  Github,
  Users,
  Book,
  Code,
  FileText,
  Bell,
  Shield,
  Languages,
  Palette,
  Keyboard,
} from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { logOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { useDynamicStatus } from '@/hooks/use-dynamic-status';

export function UserNav() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { showStatus } = useDynamicStatus();

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
      router.refresh(); // Force a refresh to clear client-side cache
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error.message || 'Could not log you out. Please try again.',
      });
    }
  };
  
  const handleHelpCenterHover = () => {
    showStatus('Find answers and get help.', {
        icon: LifeBuoy,
        duration: 3000
    });
  }

  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return (
      <>
        {/* Desktop Button */}
        <Button asChild className="hidden md:inline-flex">
            <Link href="/auth/login">
            <LogIn className="mr-2 h-4 w-4" />
            Login
            </Link>
        </Button>
         {/* Mobile Icon Button */}
        <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/auth/login">
                <LogIn className="h-5 w-5" />
                <span className="sr-only">Login</span>
            </Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {user.photoURL ? (
              <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
            ) : (
              <AvatarFallback>
                {(user.displayName || user.email)?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 max-h-[90vh] overflow-y-auto" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href="/auth/profile">
              <UserIcon />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuItem asChild>
            <Link href="/settings/general">
              <Settings />
              <span>General Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings/notifications">
              <Bell />
              <span>Notifications</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/settings/appearance">
              <Palette />
              <span>Appearance</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuLabel>Help &amp; Support</DropdownMenuLabel>
          <DropdownMenuItem asChild onMouseEnter={handleHelpCenterHover}>
            <a href="/help-center" target="_blank" rel="noopener noreferrer">
              <LifeBuoy />
              <span>Help Center</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/contact">
              <Mail />
              <span>Contact Support</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/whats-new">
              <PlusCircle />
              <span>What's New</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
