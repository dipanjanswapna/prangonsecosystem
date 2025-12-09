import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { AuthLayout } from '../auth-layout';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign In"
      description="Enter your email and password to sign in"
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="remember-me" />
          <Label htmlFor="remember-me">Remember me</Label>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <Button className="w-full auth-button">Sign In</Button>
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="underline text-primary font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
