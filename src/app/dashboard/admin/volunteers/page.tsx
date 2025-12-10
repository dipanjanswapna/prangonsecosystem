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
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Check, X, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { updateUserVolunteerStatus } from '@/lib/auth';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  volunteerStatus: 'pending' | 'approved' | 'rejected';
  photoURL?: string;
  createdAt: Timestamp;
}

export default function AdminVolunteersPage() {
  const { data: volunteers, loading } = useCollection<Volunteer>(
    'users',
    undefined,
    undefined,
    undefined,
    undefined,
    [['isVolunteer', '==', true]]
  );
  const { toast } = useToast();

  const handleUpdateStatus = async (
    uid: string,
    status: 'approved' | 'rejected'
  ) => {
    try {
      await updateUserVolunteerStatus(uid, status);
      toast({
        title: 'Volunteer Status Updated',
        description: `Volunteer has been successfully ${status}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update volunteer status.',
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'secondary';
      case 'pending':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
            <UserCheck />
            Volunteer Management
        </CardTitle>
        <CardDescription>
          Review and manage all volunteer applications from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Application Date
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
              : volunteers.map((volunteer) => (
                  <TableRow key={volunteer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={volunteer.photoURL}
                            alt={volunteer.name}
                          />
                          <AvatarFallback>
                            {volunteer.name?.charAt(0).toUpperCase() || 'V'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{volunteer.name}</div>
                          <div className="text-sm text-muted-foreground break-all">
                            {volunteer.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={getStatusVariant(volunteer.volunteerStatus)}
                        className="capitalize"
                      >
                        {volunteer.volunteerStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {volunteer.createdAt
                        ? new Date(
                            volunteer.createdAt.seconds * 1000
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
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(volunteer.id, 'approved')
                            }
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(volunteer.id, 'rejected')
                            }
                            className="text-red-600 focus:text-red-600"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
         {!loading && volunteers.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg mt-4">
                <p className="text-muted-foreground">No pending volunteer applications.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
