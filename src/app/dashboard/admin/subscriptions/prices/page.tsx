'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PricesTable } from './prices-table';

export default function AdminPricesPage() {
  return (
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
  );
}
