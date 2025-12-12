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
import { MoreHorizontal, Droplets, CheckCircle, XCircle, Eye, ShieldCheck } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { updateBloodRequestStatus, toggleBloodRequestVerification } from '@/lib/blood';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  hospitalName: string;
  status: 'pending' | 'fulfilled' | 'closed';
  verified: boolean;
  createdAt: Timestamp;
}

export default function AdminBloodRequestsPage() {
  const { data: requests, loading } = useCollection<BloodRequest>(
    'bloodRequests',
    undefined,
    undefined,
    { field: 'createdAt', direction: 'desc' }
  );
  const { toast } = useToast();

  const handleUpdateStatus = async (
    id: string,
    status: 'fulfilled' | 'closed'
  ) => {
    try {
      await updateBloodRequestStatus(id, status);
      toast({
        title: 'Request Status Updated',
        description: `Request has been marked as ${status}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update the request status.',
      });
    }
  };
  
  const handleVerification = async (id: string) => {
    try {
        const newStatus = await toggleBloodRequestVerification(id);
        toast({
            title: `Request ${newStatus ? 'Verified' : 'Unverified'}`,
            description: `The request has been successfully updated.`
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: error.message || 'Could not update verification status.'
        })
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return 'secondary';
      case 'pending':
        return 'default';
      case 'closed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets />
          Blood Requests Management
        </CardTitle>
        <CardDescription>
          Review and manage all blood donation requests from users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead className="hidden md:table-cell">Verified</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-12" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              : requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.patientName}
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{request.bloodGroup}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={request.verified ? "secondary" : "outline"} className={cn(request.verified && "text-green-700 dark:text-green-300")}>
                        {request.verified ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                     <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={getStatusVariant(request.status)}
                        className="capitalize"
                      >
                        {request.status}
                      </Badge>
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
                           <DropdownMenuItem asChild>
                              <Link href={`/blood-donation/requests/${request.id}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem
                            onClick={() =>
                              handleVerification(request.id)
                            }
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {request.verified ? 'Unverify' : 'Verify Request'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(request.id, 'fulfilled')
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Fulfilled
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(request.id, 'closed')
                            }
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Mark as Closed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {!loading && requests.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg mt-4">
            <p className="text-muted-foreground">
              No blood requests have been made yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    