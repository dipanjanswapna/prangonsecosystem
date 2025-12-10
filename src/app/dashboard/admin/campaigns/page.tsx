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
import { MoreHorizontal, Edit, Trash2, PlusCircle } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface Campaign {
  id: string;
  title: string;
  goal: number;
  raised: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  category: 'Seasonal' | 'Emergency' | 'Regular';
  createdAt: Timestamp;
}

export default function AdminCampaignsPage() {
  const { data: campaigns, loading } = useCollection<Campaign>('campaigns');

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'archived':
      case 'draft':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>
              Manage all fundraising campaigns from here.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/admin/campaigns/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Campaign
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Progress</TableHead>
                <TableHead className="hidden lg:table-cell">Goal</TableHead>
                <TableHead className="hidden xl:table-cell">Raised</TableHead>
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
                        <Skeleton className="h-5 w-48" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-4 w-full" />
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
                : campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className='font-medium'>{campaign.title}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={getStatusVariant(campaign.status)}
                          className="capitalize"
                        >
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className='flex items-center gap-2'>
                           <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2 w-24" />
                           <span>{((campaign.raised / campaign.goal) * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell font-semibold">
                        ৳{campaign.goal.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell font-semibold">
                         ৳{campaign.raised.toLocaleString()}
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
                            <DropdownMenuItem disabled>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              disabled
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
        </CardContent>
      </Card>
    </>
  );
}
