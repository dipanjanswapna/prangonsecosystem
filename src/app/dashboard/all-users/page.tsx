'use client';
import { useState } from 'react';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, View, FileDown, Gem, Star, Gift } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Timestamp } from 'firebase/firestore';
import { ROLES, type Role } from '@/lib/roles';
import {
  updateUserRoleAndStatus,
  updateUserProfileStatus,
  deleteUserAccount,
  resetUserPoints,
} from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { unparse } from 'papaparse';


interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'pending' | 'approved' | 'rejected';
  profile_status?: 'incomplete' | 'pending_review' | 'complete';
  level?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points?: number;
  photoURL?: string;
  createdAt: Timestamp;
  profileUpdatedAt?: Timestamp;
  lastGiftClaimedAt?: Timestamp;
  // Role specific fields
  specialization?: string;
  experienceYears?: number;
  department?: string;
  teamSize?: number;
  skills?: string[];
  portfolioLink?: string;
}

export default function AllUsersPage() {
  const { data: users, loading } = useCollection<User>('users');
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isResetAlertOpen, setIsResetAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleUpdateUserStatus = async (
    uid: string,
    status: 'pending' | 'approved' | 'rejected'
  ) => {
    try {
      // This function only updates the main `status`, not the profile_status
      await updateUserRoleAndStatus(
        uid,
        users.find((u) => u.id === uid)!.role,
        status
      );
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

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsAlertOpen(true);
  };
  
  const openResetDialog = (user: User) => {
    setUserToReset(user);
    setIsResetAlertOpen(true);
  }
  
  const openDetailsDialog = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };


  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserAccount(userToDelete.id);
      toast({
        title: 'User Deleted',
        description: `${userToDelete.name} has been permanently deleted.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message || 'Could not delete user.',
      });
    } finally {
      setIsAlertOpen(false);
      setUserToDelete(null);
    }
  };
  
  const handleResetPoints = async () => {
    if (!userToReset) return;
    try {
      await resetUserPoints(userToReset.id);
      toast({
        title: 'Points Reset Successful',
        description: `${userToReset.name}'s points have been reset to 0.`
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: error.message || 'Could not reset user points.'
      });
    } finally {
        setIsResetAlertOpen(false);
        setUserToReset(null);
        setIsDetailsOpen(false);
    }
  }

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
      case 'Bronze':
        return 'outline';
      case 'Silver':
         return 'secondary';
      case 'Gold':
        return 'default';
       case 'Platinum':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const downloadAsCSV = () => {
    if (!users || users.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'There is no user data to export.',
      });
      return;
    }
    
    // Convert Timestamps to ISO strings for readability
    const sanitizedData = users.map(user => ({
      ...user,
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : user.skills,
      createdAt: user.createdAt ? new Date(user.createdAt.seconds * 1000).toISOString() : '',
      profileUpdatedAt: user.profileUpdatedAt ? new Date(user.profileUpdatedAt.seconds * 1000).toISOString() : '',
      lastGiftClaimedAt: user.lastGiftClaimedAt ? new Date(user.lastGiftClaimedAt.seconds * 1000).toISOString() : ''
    }));

    const csv = unparse(sanitizedData, {
        header: true,
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
        title: 'Export Successful',
        description: 'User data has been downloaded as a CSV file.',
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              A list of all users in the system. You can manage their roles and
              approval status here.
            </CardDescription>
          </div>
          <Button onClick={downloadAsCSV} disabled={loading || !users || users.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Level</TableHead>
                <TableHead className="hidden md:table-cell">Points</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Account Status
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  Created At
                </TableHead>
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
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar>
                            <AvatarImage src={user.photoURL} alt={user.name} />
                            <AvatarFallback>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground break-all">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                         <Badge variant={getStatusVariant(user.level || 'Bronze')}>
                          {user.level || 'Bronze'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span className="font-semibold">{user.points?.toLocaleString() || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant={getStatusVariant(user.status)}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
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
                            <DropdownMenuLabel>
                              Review & Actions
                            </DropdownMenuLabel>
                             <DropdownMenuItem onClick={() => openDetailsDialog(user)}>
                              <View className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>
                              Account Actions
                            </DropdownMenuLabel>
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
                            <DropdownMenuLabel>
                              Profile Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateUserProfileStatus(user.id, 'complete')
                              }
                            >
                              Approve Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateUserProfileStatus(
                                  user.id,
                                  'incomplete'
                                )
                              }
                            >
                              Request Profile Update
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/40"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
           {!loading && users.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg mt-4">
                <p className="text-muted-foreground">No users found in the system.</p>
            </div>
        )}
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user
              <span className="font-bold"> {userToDelete?.name}</span> and
              remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Yes, delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
       <AlertDialog open={isResetAlertOpen} onOpenChange={setIsResetAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset User Points?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset <span className="font-bold">{userToReset?.name}'s</span> points to 0 and their level to Bronze. This action is usually performed after a gift has been claimed. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPoints}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Yes, Reset Points
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile Details</DialogTitle>
            <DialogDescription>
              Review the information submitted by {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <>
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                        <p className="text-muted-foreground">Full Name</p>
                        <p className="font-medium">{selectedUser.name}</p>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium break-all">{selectedUser.email}</p>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                        <p className="text-muted-foreground">Role</p>
                        <p className="font-medium capitalize">{selectedUser.role}</p>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                        <p className="text-muted-foreground">Points</p>
                        <p className="font-medium">{selectedUser.points?.toLocaleString() || 0}</p>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                        <p className="text-muted-foreground">Level</p>
                        <p className="font-medium">{selectedUser.level || 'Bronze'}</p>
                    </div>
                    {selectedUser.role === ROLES.MODERATOR && (
                        <>
                            <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                                <p className="text-muted-foreground">Specialization</p>
                                <p className="font-medium">{selectedUser.specialization || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                                <p className="text-muted-foreground">Experience</p>
                                <p className="font-medium">{selectedUser.experienceYears} years</p>
                            </div>
                        </>
                    )}
                    {selectedUser.role === ROLES.MANAGER && (
                        <>
                            <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                                <p className="text-muted-foreground">Department</p>
                                <p className="font-medium">{selectedUser.department || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                                <p className="text-muted-foreground">Team Size</p>
                                <p className="font-medium">{selectedUser.teamSize}</p>
                            </div>
                        </>
                    )}
                     {selectedUser.role === ROLES.COLLABORATOR && (
                        <>
                            <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-start gap-4">
                                <p className="text-muted-foreground mt-1">Skills</p>
                                <p className="font-medium whitespace-pre-wrap">
                                    {Array.isArray(selectedUser.skills) ? selectedUser.skills.join(', ') : selectedUser.skills || 'N/A'}
                                </p>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                                <p className="text-muted-foreground">Portfolio</p>
                                <a href={selectedUser.portfolioLink} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline break-all">{selectedUser.portfolioLink || 'N/A'}</a>
                            </div>
                        </>
                    )}
                    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                        <p className="text-muted-foreground">Last Gift Claimed</p>
                        <p className="font-medium">{selectedUser.lastGiftClaimedAt ? new Date(selectedUser.lastGiftClaimedAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] items-center gap-4">
                        <p className="text-muted-foreground">Profile Submitted On</p>
                        <p className="font-medium">{selectedUser.profileUpdatedAt ? new Date(selectedUser.profileUpdatedAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                    </div>
                </div>
                <DialogFooter className="pt-4 border-t">
                    <Button variant="destructive" onClick={() => openResetDialog(selectedUser)}>
                        <Gift className="mr-2 h-4 w-4" />
                        Reset Points (Claim Gift)
                    </Button>
                </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
