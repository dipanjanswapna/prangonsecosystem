import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AuthLayout } from '../auth-layout';

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create an Account"
      description="Enter your details below to create your account"
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input id="full-name" placeholder="Dipanjan S. PRANGON" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <Button className="w-full auth-button">Create Account</Button>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="underline text-primary font-medium">
            Log In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
