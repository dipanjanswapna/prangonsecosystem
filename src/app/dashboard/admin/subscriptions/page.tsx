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
import { PricesTable } from './prices/prices-table';

export default function AdminSubscriptionsPage() {
  return (
    <Tabs defaultValue="plans">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="prices">Prices</TabsTrigger>
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
       <TabsContent value="prices">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Prices</CardTitle>
            <CardDescription>
              Manage prices for all subscription plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PricesTable />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
