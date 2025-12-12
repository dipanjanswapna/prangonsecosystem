'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase/auth/use-user';
import { Copy, Gift, Loader2, Droplets, User as UserIcon, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import geoData from '@/lib/bd-geo-data.json';

interface UserAddress {
  streetAddress?: string;
  thana?: string;
  upazila?: string;
  district?: string;
  division?: string;
}

interface UserProfile {
  uid?: string;
  referralCode?: string;
  name: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  bloodGroup?: string;
  totalDonations?: number;
  lastDonationDate?: { seconds: number, nanoseconds: number };
  dateOfBirth?: string; // Stored as ISO string
  gender?: 'Male' | 'Female' | 'Other';
  address?: UserAddress;
  profession?: string;
}

function ProfilePageContent() {
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const uidFromQuery = searchParams.get('uid');
  const profileId = uidFromQuery || user?.uid;

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(
    profileId ? `users/${profileId}` : null
  );
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [gender, setGender] = useState('');
  const [profession, setProfession] = useState('');
  const [address, setAddress] = useState<UserAddress>({});
  
  const [isSaving, setIsSaving] = useState(false);
  
  const isOwnProfile = useMemo(() => !uidFromQuery || uidFromQuery === user?.uid, [uidFromQuery, user]);

  const handleAddressChange = (field: keyof UserAddress, value: string) => {
    setAddress(prev => {
        const newAddress = { ...prev, [field]: value };
        // Reset dependent fields when a higher-level field changes
        if (field === 'division') {
            newAddress.district = '';
            newAddress.upazila = '';
        } else if (field === 'district') {
            newAddress.upazila = '';
        }
        return newAddress;
    });
  };

  const districtsForSelectedDivision = useMemo(() => {
    if (!address.division) return [];
    const selectedDivision = geoData.divisions.find(d => d.name === address.division);
    return selectedDivision?.districts || [];
  }, [address.division]);

  const upazilasForSelectedDistrict = useMemo(() => {
    if (!address.district) return [];
    const selectedDistrict = districtsForSelectedDivision.find(d => d.name === address.district);
    return selectedDistrict?.upazilas || [];
  }, [address.district, districtsForSelectedDivision]);

  useEffect(() => {
    if (!loading && !user && !uidFromQuery) {
      router.push('/auth/login');
    }
    if (userProfile) {
        setName(userProfile.name || '');
        setPhone(userProfile.phone || '');
        setBloodGroup(userProfile.bloodGroup || 'Not Set');
        setDateOfBirth(userProfile.dateOfBirth ? parseISO(userProfile.dateOfBirth) : undefined);
        setGender(userProfile.gender || '');
        setProfession(userProfile.profession || '');
        setAddress(userProfile.address || {});
    }
  }, [user, loading, router, userProfile, uidFromQuery]);

  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register?ref=${userProfile?.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Link Copied!',
      description: 'Your referral link has been copied to the clipboard.',
    });
  };

  const handleSaveChanges = async () => {
    if (!user || !isOwnProfile) return;
    setIsSaving(true);
    try {
        const dataToUpdate: Partial<UserProfile> = { 
            name, 
            phone, 
            bloodGroup: bloodGroup === 'Not Set' ? 'Not Set' : bloodGroup,
            dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
            gender: gender as UserProfile['gender'],
            address,
            profession
        };
        
        await updateUserProfile(user.uid, dataToUpdate);
        toast({
            title: 'Profile Updated',
            description: 'Your changes have been saved successfully.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'Could not save your changes.',
        });
    } finally {
        setIsSaving(false);
    }
  }

  if (loading || profileLoading || !profileId) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-60 mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
             <Skeleton className="h-20 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
          </CardContent>
           <CardFooter>
                <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          {isOwnProfile ? "My Profile" : `${userProfile?.name}'s Profile`}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {isOwnProfile ? "Manage your account settings and profile information." : "Viewing public profile information."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
              <UserIcon className='h-6 w-6' />
              Personal Information
          </CardTitle>
          <CardDescription>
             {isOwnProfile ? "Update your personal details here." : "Basic user information."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userProfile?.photoURL} alt={userProfile?.name || 'User'} />
              <AvatarFallback>
                {(userProfile?.name)?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && <Button variant="outline" disabled>Change Photo</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} readOnly={!isOwnProfile}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={userProfile?.email || ''} readOnly disabled />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} readOnly={!isOwnProfile} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !dateOfBirth && "text-muted-foreground")}
                        disabled={!isOwnProfile}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={setDateOfBirth}
                        disabled={!isOwnProfile}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
             <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender} disabled={!isOwnProfile}>
                    <SelectTrigger id="gender">
                        <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} readOnly={!isOwnProfile} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
              <MapPin className='h-6 w-6' />
              Address
          </CardTitle>
          <CardDescription>
             Your location details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="division">Division</Label>
                     <Select value={address.division} onValueChange={(value) => handleAddressChange('division', value)} disabled={!isOwnProfile}>
                        <SelectTrigger id="division">
                            <SelectValue placeholder="Select Division" />
                        </SelectTrigger>
                        <SelectContent>
                            {geoData.divisions.map(division => (
                                <SelectItem key={division.id} value={division.name}>{division.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                     <Select value={address.district} onValueChange={(value) => handleAddressChange('district', value)} disabled={!isOwnProfile || !address.division}>
                        <SelectTrigger id="district">
                            <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                             {districtsForSelectedDivision.map(district => (
                                <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="upazila">Upazila</Label>
                     <Select value={address.upazila} onValueChange={(value) => handleAddressChange('upazila', value)} disabled={!isOwnProfile || !address.district}>
                        <SelectTrigger id="upazila">
                            <SelectValue placeholder="Select Upazila" />
                        </SelectTrigger>
                        <SelectContent>
                            {upazilasForSelectedDistrict.map(upazila => (
                                <SelectItem key={upazila.id} value={upazila.name}>{upazila.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="thana">Thana</Label>
                    <Input id="thana" value={address.thana || ''} onChange={(e) => handleAddressChange('thana', e.target.value)} readOnly={!isOwnProfile}/>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="street-address">Street Address / Village</Label>
                <Textarea id="street-address" value={address.streetAddress || ''} onChange={(e) => handleAddressChange('streetAddress', e.target.value)} readOnly={!isOwnProfile} />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Droplets className="h-6 w-6" />
                Blood Donation Information
            </CardTitle>
            <CardDescription>
              {isOwnProfile ? "Manage your blood donation details. This helps us find matches faster." : "Blood donation statistics."}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="blood-group">Blood Group</Label>
                    <Select value={bloodGroup} onValueChange={setBloodGroup} disabled={!isOwnProfile}>
                        <SelectTrigger id="blood-group">
                            <SelectValue placeholder="Select your blood group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Not Set">Not Set</SelectItem>
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
                </div>
                 <div className="space-y-2">
                    <Label>Total Donations</Label>
                    <Input readOnly disabled value={userProfile?.totalDonations || 0} />
                </div>
            </div>
            <div className='space-y-2'>
                <Label>Last Donation Date</Label>
                <Input readOnly disabled value={userProfile?.lastDonationDate ? format(new Date(userProfile.lastDonationDate.seconds * 1000), 'PPP') : 'N/A'} />
            </div>
        </CardContent>
      </Card>
      
      {isOwnProfile && (
        <div className="flex justify-end">
            <Button onClick={handleSaveChanges} disabled={isSaving} size="lg">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save All Changes
            </Button>
        </div>
      )}
      
       {isOwnProfile && userProfile?.referralCode && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Gift className="h-6 w-6" />
                Referral Information
            </CardTitle>
            <CardDescription>
              Invite friends to earn rewards. Share your unique link below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Your Referral Code</Label>
              <p className="font-mono text-lg font-semibold bg-muted px-3 py-2 rounded-md">{userProfile.referralCode}</p>
            </div>
            <div>
              <Label>Your Referral Link</Label>
              <div className="flex gap-2">
                <Input readOnly value={referralLink} className="bg-muted/50" />
                <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copy referral link">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}


export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading profile...</div>}>
            <ProfilePageContent />
        </Suspense>
    )
}
