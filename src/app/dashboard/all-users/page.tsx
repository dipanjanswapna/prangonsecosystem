'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Timestamp } from 'firebase/firestore';
import { ROLES, type Role } from '@/lib/roles';
import { updateUserRoleAndStatus, updateUserProfileStatus } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'pending' | 'approved' | 'rejected';
  profile_status?: 'incomplete' | 'pending_review' | 'complete';
  photoURL?: string;
  createdAt: Timestamp;
}

export default function AllUsersPage() {
  const { data: users, loading } = useCollection<User>('users');
  const { toast } = useToast();

  const handleUpdateUserStatus = async (
    uid: string,
    status: 'pending' | 'approved' | 'rejected'
  ) => {
    try {
      // This function only updates the main `status`, not the profile_status
      await updateUserRoleAndStatus(uid, users.find(u=>u.id===uid)!.role, status);
      toast({
        title: 'User Status Updated',
        description: `User has been successfully ${status}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update user status.',
      });
    }
  };

  const handleUpdateUserProfileStatus = async (
    uid: string,
    profileStatus: 'incomplete' | 'pending_review' | 'complete'
  ) => {
    try {
      await updateUserProfileStatus(uid, profileStatus);
      toast({
        title: 'Profile Status Updated',
        description: `User profile status set to ${profileStatus}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update profile status.',
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
      case 'complete':
        return 'secondary';
      case 'pending':
      case 'pending_review':
        return 'default';
      case 'rejected':
      case 'incomplete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          A list of all users in the system. You can manage their roles and
          approval status here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">Role</TableHead>
              <TableHead className="hidden md:table-cell">Account Status</TableHead>
              <TableHead className="hidden md:table-cell">Profile Status</TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                     <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              : users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.photoURL} alt={user.name} />
                        <AvatarFallback>
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={getStatusVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                     <TableCell className="hidden md:table-cell">
                      <Badge variant={getStatusVariant(user.profile_status || 'N/A')}>
                        {user.profile_status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.createdAt
                        ? new Date(
                            user.createdAt.seconds * 1000
                          ).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateUserStatus(user.id, 'approved')
                            }
                          >
                            Approve Account
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateUserStatus(user.id, 'rejected')
                            }
                          >
                            Reject Account
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuLabel>Profile Actions</DropdownMenuLabel>
                             <DropdownMenuItem
                            onClick={() =>
                              handleUpdateUserProfileStatus(user.id, 'complete')
                            }
                          >
                            Approve Profile
                          </DropdownMenuItem>
                           <DropdownMenuItem
                            onClick={() =>
                              handleUpdateUserProfileStatus(user.id, 'incomplete')
                            }
                          >
                            Request Profile Update
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
