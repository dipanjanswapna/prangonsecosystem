'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AuthLayout } from '../auth-layout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { signUp } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password, values.fullName);
      toast({
        title: 'Account Created!',
        description: "You've been successfully signed up. Redirecting to login...",
      });
      router.push('/auth/login');
    } catch (error: any) {
      console.error('Signup Error:', error);
      let description = 'There was a problem with your request.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email address is already in use. Please try another one.';
      } else {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      description="Enter your details below to create your account"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="full-name">Full Name</FormLabel>
                <FormControl>
                  <Input
                    id="full-name"
                    placeholder="Dipanjan S. PRANGON"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="password">Password</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4 mt-2">
            <Button type="submit" className="w-full auth-button" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </div>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="underline text-primary font-medium">
          Log In
        </Link>
      </div>
    </AuthLayout>
  );
}
