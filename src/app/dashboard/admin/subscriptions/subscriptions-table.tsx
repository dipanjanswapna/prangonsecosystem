'use client';
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
import { MoreHorizontal, Check, X, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateSubscriptionStatus } from '@/lib/subscriptions';
import { cn } from '@/lib/utils';
import type { Timestamp } from 'firebase/firestore';

interface Subscription {
  id: string;
  userId: string;
  userName?: string;
  planName?: string;
  status: 'pending' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
  currentPeriodEnd: Timestamp;
}

export function SubscriptionsTable() {
  const { data: subscriptions, loading } = useCollection<Subscription>('subscriptions');
  const { toast } = useToast();

  const handleUpdateStatus = async (
    userId: string,
    subscriptionId: string,
    status: 'active' | 'past_due' | 'canceled'
  ) => {
    try {
      await updateSubscriptionStatus(userId, subscriptionId, status);
      toast({
        title: 'Subscription Updated',
        description: `Subscription status has been set to ${status}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update the subscription.',
      });
    }
  };
  
   const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'secondary';
      case 'pending':
        return 'default';
      case 'past_due':
      case 'canceled':
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead className="hidden md:table-cell">Plan</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="hidden lg:table-cell">End Date</TableHead>
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
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                     <Skeleton className="h-5 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            : subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.userName || sub.userId}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {sub.planName || 'N/A'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={getStatusVariant(sub.status)}
                      className="capitalize"
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Date(sub.currentPeriodEnd.seconds * 1000).toLocaleDateString()}
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
                            onClick={() => handleUpdateStatus(sub.userId, sub.id, 'active')}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Mark as Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                           onClick={() => handleUpdateStatus(sub.userId, sub.id, 'past_due')}
                        >
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Mark as Past Due
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleUpdateStatus(sub.userId, sub.id, 'canceled')}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel Subscription
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </>
  );
}
