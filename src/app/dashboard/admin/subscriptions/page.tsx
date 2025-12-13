'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { PlansTable } from './plans-table';

export default function AdminSubscriptionsPage() {
  return (
    <Tabs defaultValue="plans">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="prices" disabled>Prices (coming soon)</TabsTrigger>
          <TabsTrigger value="coupons" disabled>Coupons (coming soon)</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="plans">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Manage all subscription plans available to users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlansTable />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
