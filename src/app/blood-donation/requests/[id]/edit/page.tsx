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
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { updateBloodRequest } from '@/lib/blood';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  patientName: z.string().min(3, 'Patient name must be at least 3 characters.'),
  patientAge: z.coerce.number().min(1, 'Please enter a valid age.').max(120, 'Please enter a valid age.'),
  patientGender: z.enum(['Male', 'Female', 'Other'], { required_error: "Please select patient's gender." }),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], { required_error: "Please select a blood group." }),
  donationType: z.enum(['Whole Blood', 'Platelets', 'Plasma']).default('Whole Blood'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1 bag.'),
  hospitalName: z.string().min(5, 'Hospital name is required.'),
  location: z.string().min(3, 'Location is required.'),
  neededBy: z.date({ required_error: 'Please select a date.' }),
  urgencyLevel: z.enum(['Normal', 'Urgent', 'Critical']).default('Normal'),
  preferredTime: z.enum(['Morning', 'Afternoon', 'Evening', 'Night', 'Anytime']).default('Anytime'),
  contactPerson: z.string().min(3, 'Contact person name is required.'),
  contactPhone: z.string().regex(/^(\+88)?01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number.'),
  alternateContact: z.string().regex(/^(\+88)?01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number.').optional().or(z.literal('')),
  reason: z.string().min(10, 'Please provide a brief reason for the request.'),
  prescriptionUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  notes: z.string().optional(),
});

interface BloodRequest {
  id: string;
  requesterId: string;
  neededBy: { seconds: number; nanoseconds: number };
  [key: string]: any;
}

const EditRequestSkeleton = () => (
    <Card className="max-w-3xl mx-auto">
        <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="space-y-6">
                <Skeleton className="h-6 w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
             <div className="space-y-6">
                <Skeleton className="h-6 w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <Skeleton className="h-12 w-full" />
        </CardContent>
    </Card>
)

export default function EditRequestPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const { user, loading: userLoading } = useUser();
  const { data: request, loading: requestLoading } = useDoc<BloodRequest>(
    requestId ? `bloodRequests/${requestId}` : null
  );

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      patientAge: 0,
      patientGender: undefined,
      bloodGroup: undefined,
      donationType: 'Whole Blood',
      quantity: 1,
      hospitalName: '',
      location: '',
      neededBy: new Date(),
      urgencyLevel: 'Normal',
      preferredTime: 'Anytime',
      contactPerson: '',
      contactPhone: '',
      alternateContact: '',
      reason: '',
      prescriptionUrl: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (request) {
      // Security check: only the requester can edit
      if (user && user.uid !== request.requesterId) {
        toast({ variant: 'destructive', title: 'Access Denied', description: 'You are not authorized to edit this request.' });
        router.push(`/blood-donation/requests/${requestId}`);
        return;
      }
      
      // Pre-fill the form with existing data
      const currentData = { ...request };
      if (request.neededBy) {
          currentData.neededBy = new Date(request.neededBy.seconds * 1000);
      }
      form.reset(currentData as any);
    }
  }, [request, user, router, toast, requestId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await updateBloodRequest(requestId, values);
      toast({
        title: 'Request Updated!',
        description: 'Your blood request has been successfully updated.',
      });
      router.push(`/blood-donation/requests/${requestId}`);
    } catch (error) {
      console.error('Error updating blood request:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to update request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (userLoading || requestLoading) {
      return <EditRequestSkeleton />;
  }

  if (!request) {
      notFound();
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Edit Blood Request</CardTitle>
            <CardDescription>
              Update the details for your blood request below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            <div className="space-y-6">
                <h3 className="font-semibold text-lg">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
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
                        name="patientAge"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 28" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="patientGender"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Patient's Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select patient's gender" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <Separator />

            <div className="space-y-6">
                <h3 className="font-semibold text-lg">Donation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <FormField
                        control={form.control}
                        name="donationType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Donation Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select donation type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Whole Blood">Whole Blood</SelectItem>
                                    <SelectItem value="Platelets">Platelets</SelectItem>
                                    <SelectItem value="Plasma">Plasma</SelectItem>
                                </SelectContent>
                            </Select>
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
                    name="urgencyLevel"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Urgency Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select urgency" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Normal">Normal</SelectItem>
                                <SelectItem value="Urgent">Urgent</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
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
            </div>
            
            <Separator />

             <div className="space-y-6">
                <h3 className="font-semibold text-lg">Location & Time</h3>
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
                                  "pl-3 text-left font-normal h-10",
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
                                date < new Date(new Date().setHours(0,0,0,0)) || date > new Date(new Date().setDate(new Date().getDate() + 30))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                        control={form.control}
                        name="preferredTime"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Preferred Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select preferred time" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Anytime">Anytime</SelectItem>
                                    <SelectItem value="Morning">Morning (8am-12pm)</SelectItem>
                                    <SelectItem value="Afternoon">Afternoon (12pm-5pm)</SelectItem>
                                    <SelectItem value="Evening">Evening (5pm-9pm)</SelectItem>
                                    <SelectItem value="Night">Night (9pm onwards)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <Separator />
            
            <div className="space-y-6">
                 <h3 className="font-semibold text-lg">Contact & Other Info</h3>
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
                 <FormField
                    control={form.control}
                    name="alternateContact"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Alternate Contact (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="A second number for emergencies" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Notes for Donor (Optional)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Any specific instructions or information for the donor..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="prescriptionUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Prescription/Document URL (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com/prescription.jpg" {...field} />
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
              Save Changes
            </Button>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
