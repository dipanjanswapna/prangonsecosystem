'use client';

import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Printer, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';

interface Donation {
  id: string;
  invoiceId: string;
  campaignId: string;
  campaignTitle: string;
  donorName: string;
  donorEmail: string | null;
  amount: number;
  currency: string;
  gateway: string;
  transactionId?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  createdAt: { seconds: number; nanoseconds: number };
}

function InvoiceSkeleton() {
    return (
        <Card>
            <CardHeader className="bg-muted/30 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-24 mb-1" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="text-right">
                        <Skeleton className="h-7 w-40 mb-1" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                <div className="flex items-center justify-center text-center py-8 flex-col gap-2 border-b">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-8 w-72 mt-2" />
                    <Skeleton className="h-4 w-96 mt-1" />
                    <Skeleton className="h-4 w-80 mt-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="space-y-2 text-left md:text-right">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-44" />
                         <Skeleton className="h-5 w-52" />
                    </div>
                </div>
                 <Skeleton className="h-40 w-full" />
            </CardContent>
            <CardFooter className="flex-col sm:flex-row gap-4 justify-between items-center bg-muted/30 p-6">
                <Skeleton className="h-4 w-full max-w-sm" />
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    );
}


// In a real app, you would fetch donation details by `params.donationId`
export default function InvoicePage() {
  const params = useParams();
  const { donationId } = params;
  const { data: donation, loading } = useDoc<Donation>(donationId ? `donations/${donationId}`: null);
  
  if (loading) {
    return (
        <div className="max-w-3xl mx-auto">
            <InvoiceSkeleton />
        </div>
    );
  }

  if (!donation) {
    notFound(); 
  }
  
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
  
  const getStatusClass = (status: string) => {
     switch (status) {
      case 'success':
        return 'text-green-600 border-green-600/50';
      case 'pending':
        return 'text-amber-600 border-amber-600/50';
      case 'failed':
      case 'refunded':
        return 'text-red-600 border-red-600/50';
      default:
        return '';
    }
  }


  return (
    <div className="max-w-3xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-2xl font-bold">ONGON</h1>
                    <p className="text-muted-foreground text-sm">Donation Receipt</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-lg">Invoice #{donation.id.substring(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">Date: {new Date(donation.createdAt.seconds * 1000).toLocaleDateString()}</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
            <div className="flex items-center justify-center text-center py-8 flex-col gap-2 border-b">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-semibold">Thank You for Your Donation!</h2>
                <p className="text-muted-foreground max-w-md">
                    Your generous contribution helps us continue our work. We are incredibly grateful for your support.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <h3 className="font-semibold text-muted-foreground">Billed To</h3>
                    <p>{donation.donorName}</p>
                    <p>{donation.donorEmail}</p>
                </div>
                 <div className="space-y-2 text-left md:text-right">
                    <h3 className="font-semibold text-muted-foreground">Donation Details</h3>
                    <p>Donation ID: {donation.id}</p>
                    {donation.transactionId && <p>Transaction ID: {donation.transactionId}</p>}
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-muted-foreground mb-2">Donation Summary</h3>
                <div className="border rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-muted/50">
                        <p className="font-medium">Campaign</p>
                        <p className="font-medium">Amount</p>
                    </div>
                    <Separator />
                     <div className="flex justify-between items-center p-4">
                        <p>{donation.campaignTitle}</p>
                        <p>৳{donation.amount.toFixed(2)}</p>
                    </div>
                    <Separator />
                     <div className="flex justify-between items-center p-4 font-bold bg-muted/50">
                        <p>Total Donated</p>
                        <p>৳{donation.amount.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                 <div>
                    <h3 className="font-semibold text-foreground mb-1">Payment Method</h3>
                    <Badge variant="outline">{donation.gateway}</Badge>
                </div>
                 <div className="md:text-right">
                    <h3 className="font-semibold text-foreground mb-1">Status</h3>
                    <Badge variant={getStatusVariant(donation.status)} className={cn("capitalize", getStatusClass(donation.status))}>
                        {donation.status}
                    </Badge>
                </div>
            </div>

        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-4 justify-between items-center bg-muted/30 p-6">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
                If you have any questions, please contact support at support@ongon.org.
            </p>
            <Button onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
