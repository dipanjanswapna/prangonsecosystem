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
import { MoreHorizontal, Edit, Trash2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { deletePrice } from '@/lib/subscriptions';
import { cn } from '@/lib/utils';
import type { Timestamp } from 'firebase/firestore';

interface Price {
  id: string;
  planId: string;
  planName?: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  active: boolean;
  createdAt: Timestamp;
}

interface Plan {
    id: string;
    name: string;
}

export function PricesTable() {
  const { data: prices, loading: pricesLoading } = useCollection<Price>('prices');
  const { data: plans, loading: plansLoading } = useCollection<Plan>('plans');
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState<Price | null>(null);
  const { toast } = useToast();

  const loading = pricesLoading || plansLoading;

  const pricesWithPlanNames = useMemo(() => {
    if (loading) return [];
    return prices.map(price => {
        const plan = plans.find(p => p.id === price.planId);
        return {
            ...price,
            planName: plan?.name || price.planId,
        }
    });
  }, [prices, plans, loading]);


  const openDeleteDialog = (price: Price) => {
    setPriceToDelete(price);
    setIsAlertOpen(true);
  };

  const handleDeletePrice = async () => {
    if (!priceToDelete) return;
    try {
      await deletePrice(priceToDelete.id);
      toast({
        title: 'Price Deleted',
        description: `The price has been permanently deleted.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message || 'Could not delete the price.',
      });
    } finally {
      setIsAlertOpen(false);
      setPriceToDelete(null);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button asChild>
          <Link href="/dashboard/admin/subscriptions/prices/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Price
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="hidden md:table-cell">Interval</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                   <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            : pricesWithPlanNames.map((price) => (
                <TableRow key={price.id}>
                  <TableCell className="font-medium">{price.planName}</TableCell>
                   <TableCell className="font-semibold">{price.amount.toLocaleString()} {price.currency}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="capitalize">
                      {price.interval}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={price.active ? 'secondary' : 'destructive'}
                      className={cn(
                        'capitalize',
                        price.active &&
                          'text-green-700 dark:text-green-300'
                      )}
                    >
                      {price.active ? 'Active' : 'Inactive'}
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
                          <Link
                            href={`/dashboard/admin/subscriptions/prices/${price.id}/edit`}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => openDeleteDialog(price)}
                        >
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
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this price entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrice}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Yes, delete price
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
