'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ROLES, type Role } from '@/lib/roles';
import { updateUserProfile } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface ProfileUpdateFormProps {
  userProfile: {
    role: Role;
    name: string;
  };
  userId: string;
}

// Define different schemas for each role
const moderatorSchema = z.object({
  specialization: z.string().min(5, 'Please specify your moderation specialty.'),
  experienceYears: z.coerce.number().min(0, 'Experience must be a positive number.'),
});

const managerSchema = z.object({
  department: z.string().min(3, 'Department is required.'),
  teamSize: z.coerce.number().min(1, 'Team size must be at least 1.'),
});

const collaboratorSchema = z.object({
  skills: z.string().min(10, 'Please list some of your key skills.'),
  portfolioLink: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

const baseSchema = z.object({});

// Function to get the correct schema based on the role
const getValidationSchema = (role: Role) => {
  switch (role) {
    case ROLES.MODERATOR:
      return moderatorSchema;
    case ROLES.MANAGER:
      return managerSchema;
    case ROLES.COLLABORATOR:
      return collaboratorSchema;
    default:
      return baseSchema;
  }
};


export function ProfileUpdateForm({ userProfile, userId }: ProfileUpdateFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const validationSchema = getValidationSchema(userProfile.role);
  
  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      specialization: '',
      experienceYears: 0,
      department: '',
      teamSize: 1,
      skills: '',
      portfolioLink: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof validationSchema>) => {
    setIsLoading(true);
    try {
      await updateUserProfile(userId, values);
      toast({
        title: 'Profile Submitted!',
        description: 'Your profile has been submitted for admin review. You will be notified upon approval.',
      });
      router.push('/dashboard'); // Redirect to a waiting page or dashboard
      router.refresh();
    } catch (error: any) {
      console.error('Profile Update Error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem updating your profile.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (userProfile.role) {
      case ROLES.MODERATOR:
        return (
          <>
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moderation Specialty</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Community Forums, Content Review" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experienceYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case ROLES.MANAGER:
        return (
          <>
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Marketing, Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="teamSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Size</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case ROLES.COLLABORATOR:
        return (
          <>
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Skills</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., UI/UX Design, React, Copywriting..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="portfolioLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio/Website Link (Optional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {renderRoleSpecificFields()}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit for Review
        </Button>
      </form>
    </Form>
  );
}
