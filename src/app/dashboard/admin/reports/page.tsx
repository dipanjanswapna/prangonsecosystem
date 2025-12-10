'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Impact &amp; Usage Reports</CardTitle>
          <CardDescription>
            Manage fund allocation and report on campaign expenditures.
          </CardDescription>
        </div>
        <Button disabled>
          <FilePlus className="mr-2 h-4 w-4" />
          Add Usage Item
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Usage Reporting Coming Soon
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This section will allow you to add and manage how campaign funds are
            spent, providing full transparency to donors.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
