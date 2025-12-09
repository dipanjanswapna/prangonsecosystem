import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ProfilePage() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          My Profile
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage your account settings and profile information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Profile Information</CardTitle>
          <CardDescription>
            Update your personal details here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="@dipanjan" />}
              <AvatarFallback>DD</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Photo</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Dipanjan Das" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="dipanjan@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue="Full-Stack Developer, UI/UX Enthusiast, and Content Creator."
            />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
