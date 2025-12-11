'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { createBloodRequest } from '@/lib/blood';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  patientName: z.string().min(3, 'Patient name must be at least 3 characters.'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1 bag.'),
  hospitalName: z.string().min(5, 'Hospital name is required.'),
  location: z.string().min(3, 'Location is required.'),
  contactPerson: z.string().min(3, 'Contact person name is required.'),
  contactPhone: z.string().regex(/^(\+88)?01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number.'),
  reason: z.string().min(10, 'Please provide a brief reason for the request.'),
  neededBy: z.date({ required_error: 'Please select a date.' }),
});

export default function RequestBloodPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      quantity: 1,
      hospitalName: '',
      location: '',
      contactPerson: '',
      contactPhone: '',
      reason: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Required',
            description: 'You must be logged in to create a blood request.'
        });
        return;
    }
    setIsLoading(true);
    try {
      await createBloodRequest(user.uid, values);
      toast({
        title: 'Request Submitted!',
        description: 'Your blood request has been posted and is now visible to potential donors.',
      });
      router.push('/blood-donation');
    } catch (error) {
      console.error('Error creating blood request:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to submit request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Create a Blood Request</CardTitle>
            <CardDescription>
              Fill out the form below to post a request. Please provide accurate information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Patient Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Required Blood Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a blood group" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Blood</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Scheduled surgery, accident victim..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="hospitalName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Hospital Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., City General Hospital" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Hospital Location / Area</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Dhanmondi, Dhaka" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (Bags)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="neededBy"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Needed By</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date > new Date(new Date().setDate(new Date().getDate() + 30))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                        <Input placeholder="Name of person at location" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contact Phone Number</FormLabel>
                    <FormControl>
                        <Input placeholder="01xxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <Button type="submit" disabled={isLoading || userLoading} size="lg" className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit Request
            </Button>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
