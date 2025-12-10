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
import type { Timestamp } from 'firebase/firestore';
import { FileSearch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UsageItem {
  id: string;
  category: 'education' | 'health' | 'logistics' | 'food' | 'shelter';
  description: string;
  cost: number;
  vendor?: string;
  spentAt: Timestamp;
}

export function CampaignUsageReport({ campaignId }: { campaignId: string }) {
  const { data: usageItems, loading } = useCollection<UsageItem>(
    `campaigns/${campaignId}/usageItems`,
    undefined,
    undefined,
    { field: 'spentAt', direction: 'desc' }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fund Utilization Report</CardTitle>
        <CardDescription>
          A transparent breakdown of how the collected funds for this campaign are being used.
        </CardDescription>
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
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Cost (BDT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="capitalize">{item.category}</Badge>
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
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <FileSearch className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Usage Data Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Fund utilization reports for this campaign will appear here once available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
