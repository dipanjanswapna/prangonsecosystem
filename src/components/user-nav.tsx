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

export function UserNav() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

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

  if (loading) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/auth/login">
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Link>
      </Button>
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
              <UserIcon className="mr-2" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/dashboard/my-content">
              <FileText className="mr-2" />
              <span>My Content</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/dashboard/billing">
              <CreditCard className="mr-2" />
              <span>Billing</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/team">
              <Users className="mr-2" />
              <span>Team</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuItem asChild>
            <Link href="/settings/general">
              <Settings className="mr-2" />
              <span>General Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings/notifications">
              <Bell className="mr-2" />
              <span>Notifications</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings/security">
              <Shield className="mr-2" />
              <span>Security</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/settings/language">
              <Languages className="mr-2" />
              <span>Language</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/settings/appearance">
              <Palette className="mr-2" />
              <span>Appearance</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/settings/shortcuts">
              <Keyboard className="mr-2" />
              <span>Keyboard Shortcuts</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuLabel>Help &amp; Support</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <a href="/help-center" target="_blank" rel="noopener noreferrer">
              <LifeBuoy className="mr-2" />
              <span>Help Center</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/contact">
              <Mail className="mr-2" />
              <span>Contact Support</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/whats-new">
              <PlusCircle className="mr-2" />
              <span>What's New</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/feedback">
              <MessageSquare className="mr-2" />
              <span>Send Feedback</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Developer</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Book className="mr-2" />
              <span>API Documentation</span>
            </a>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/settings/api-keys">
              <Code className="mr-2" />
              <span>API Keys</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2" />
              <span>GitHub</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
