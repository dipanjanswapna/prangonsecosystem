'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { resetPassword } from '@/lib/auth';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setIsSuccess(false);
    try {
      await resetPassword(values.email);
      setIsSuccess(true);
      toast({
        title: 'Check your email',
        description: 'A password reset link has been sent to your email address.',
      });
    } catch (error: any) {
      console.error('Password Reset Error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          error.code === 'auth/user-not-found'
            ? 'No user found with this email address.'
            : error.message || 'There was a problem with your request.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email to receive a password reset link."
    >
      {isSuccess ? (
        <div className="text-center p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
            <h3 className="font-bold text-green-800 dark:text-green-300">Email Sent!</h3>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">Please check your inbox (and spam folder) for the password reset link.</p>
             <Button variant="link" asChild className="mt-4">
                <Link href="/auth/login">Back to Login</Link>
             </Button>
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
              <Button type="submit" className="w-full auth-button" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link href="/auth/login" className="underline text-primary font-medium">
              Log In
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
