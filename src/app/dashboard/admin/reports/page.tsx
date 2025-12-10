'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, FileSearch } from 'lucide-react';
import Link from 'next/link';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

interface UsageItem {
  id: string;
  campaignId: string;
  campaignTitle?: string;
  category: 'education' | 'health' | 'logistics' | 'food' | 'shelter';
  description: string;
  cost: number;
  spentAt: Timestamp;
}

export default function AdminReportsPage() {
  const { data: usageItems, loading } = useCollection<UsageItem>(
    'usageItems',
    undefined,
    undefined,
    { field: 'spentAt', direction: 'desc' }
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Impact &amp; Usage Reports</CardTitle>
          <CardDescription>
            Manage fund allocation and report on campaign expenditures.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/reports/add-usage">
            <FilePlus className="mr-2 h-4 w-4" />
            Add Usage Item
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : usageItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Cost (BDT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.campaignTitle || item.campaignId}
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="capitalize">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(item.spentAt.seconds * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ৳{item.cost.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileSearch className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              No Usage Data Yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Expenditure reports for all campaigns will appear here.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/admin/reports/add-usage">
                <FilePlus className="mr-2 h-4 w-4" />
                Add First Usage Item
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
