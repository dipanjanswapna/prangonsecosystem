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
import { MoreHorizontal, Download, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { updateDonationStatus } from '@/lib/donations';

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  campaignTitle: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  gateway: string;
  createdAt: Timestamp;
}

export default function AdminDonationsPage() {
  const { data: donations, loading } = useCollection<Donation>('donations');
  const { toast } = useToast();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'secondary';
      case 'pending':
        return 'default';
      case 'failed':
      case 'refunded':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const handleUpdateStatus = async (id: string, status: 'success' | 'failed' | 'refunded') => {
      try {
          await updateDonationStatus(id, status);
          toast({
              title: 'Status Updated',
              description: `Donation has been marked as ${status}.`
          });
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: 'Update Failed',
              description: 'Could not update the donation status.'
          });
      }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Donations</CardTitle>
            <CardDescription>
              A complete list of all donations received across all campaigns.
            </CardDescription>
          </div>
          <Button disabled>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead className="hidden md:table-cell">Campaign</TableHead>
                <TableHead className="hidden sm:table-cell">Amount</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="hidden xl:table-cell">Date</TableHead>
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
                         <div className="space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-3 w-40" />
                         </div>
                      </TableCell>
                       <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                       <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                       <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div className="font-medium">{donation.donorName}</div>
                        <div className="text-sm text-muted-foreground">
                          {donation.donorEmail}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{donation.campaignTitle}</TableCell>
                      <TableCell className="hidden sm:table-cell font-semibold">
                        ৳{donation.amount.toLocaleString()}
                      </TableCell>
                       <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant={getStatusVariant(donation.status)}
                          className="capitalize"
                        >
                          {donation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {donation.createdAt
                          ? new Date(
                              donation.createdAt.seconds * 1000
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUpdateStatus(donation.id, 'success')}>
                               <CheckCircle className="mr-2 h-4 w-4" />
                               Mark as Success
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleUpdateStatus(donation.id, 'failed')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Mark as Failed
                            </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem className="text-red-600 focus:text-red-600" disabled>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
    </>
  );
}
