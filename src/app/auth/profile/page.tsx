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
import { Loader2, Droplets, User as UserIcon, MapPin, Calendar as CalendarIcon, HeartPulse, AlertCircle, CheckCircle, Award, MessageSquare } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, differenceInDays, differenceInYears, addDays } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import geoData from '@/lib/bd-geo-data.json';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';


interface UserAddress {
  streetAddress?: string;
  thana?: string;
  upazila?: string;
  district?: string;
  division?: string;
}

interface UserHeight {
    feet?: number;
    inches?: number;
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
  weight?: number;
  height?: UserHeight;
  isEligible?: boolean;
  medicalConditions?: string;
  badges?: string[];
  whatsapp?: string;
  telegram?: string;
  messenger?: string;
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
  const [weight, setWeight] = useState<number | string>('');
  const [height, setHeight] = useState<UserHeight>({});
  const [isEligible, setIsEligible] = useState(true);
  const [medicalConditions, setMedicalConditions] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [messenger, setMessenger] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  
  const isOwnProfile = useMemo(() => !uidFromQuery || uidFromQuery === user?.uid, [uidFromQuery, user]);

  const eligibilityDetails = useMemo(() => {
    const reasons: string[] = [];
    let isCurrentlyEligible = true;
    let nextEligibleDate: Date | null = null;
    
    if (dateOfBirth) {
        const age = differenceInYears(new Date(), dateOfBirth);
        if (age < 18) {
            reasons.push('You must be at least 18 years old.');
            isCurrentlyEligible = false;
        }
        if (age > 60) {
            reasons.push('You must be 60 years old or younger.');
            isCurrentlyEligible = false;
        }
    } else {
        reasons.push('Your date of birth is required to verify age.');
        isCurrentlyEligible = false;
    }

    if (Number(weight) < 50) {
        reasons.push('A minimum weight of 50kg is required.');
        isCurrentlyEligible = false;
    }

    if (userProfile?.lastDonationDate) {
        const lastDonation = new Date(userProfile.lastDonationDate.seconds * 1000);
        const daysSinceLastDonation = differenceInDays(new Date(), lastDonation);
        
        const requiredGap = 90;

        if (daysSinceLastDonation < requiredGap) {
            const daysRemaining = requiredGap - daysSinceLastDonation;
            nextEligibleDate = addDays(lastDonation, requiredGap);
            reasons.push(`A minimum of ${requiredGap} days is required between donations. Please wait ${daysRemaining} more day(s).`);
            isCurrentlyEligible = false;
        }
    }

    return {
        isEligible: isCurrentlyEligible,
        reasons,
        nextEligibleDate
    };
  }, [dateOfBirth, weight, userProfile?.lastDonationDate]);


  const handleAddressChange = (field: keyof UserAddress, value: string) => {
    setAddress(prev => {
        const newAddress = { ...prev, [field]: value };
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

        if (userProfile.dateOfBirth) {
            setDateOfBirth(parseISO(userProfile.dateOfBirth));
        } else {
            setDateOfBirth(undefined);
        }

        setGender(userProfile.gender || '');
        setProfession(userProfile.profession || '');
        setAddress(userProfile.address || {});
        setWeight(userProfile.weight || '');
        setHeight(userProfile.height || {});
        setIsEligible(userProfile.isEligible === false ? false : true);
        setMedicalConditions(userProfile.medicalConditions || '');
        setWhatsapp(userProfile.whatsapp || '');
        setTelegram(userProfile.telegram || '');
        setMessenger(userProfile.messenger || '');
    }
  }, [user, loading, router, userProfile, uidFromQuery]);


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
            profession,
            weight: Number(weight) || undefined,
            height,
            isEligible,
            medicalConditions,
            whatsapp,
            telegram,
            messenger,
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
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
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
    <div className="max-w-4xl mx-auto space-y-8 pt-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          {isOwnProfile ? "My Profile" : `${userProfile?.name}'s Profile`}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {isOwnProfile ? "Manage your account settings and profile information." : "Viewing public profile information."}
        </p>
      </div>

       {userProfile?.badges && userProfile.badges.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                      <Award className='h-6 w-6' />
                      My Badges
                  </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                  {userProfile.badges.map(badge => (
                      <Badge key={badge} variant="secondary" className="text-base py-1 px-3">
                          {badge}
                      </Badge>
                  ))}
              </CardContent>
          </Card>
      )}
      
      {isOwnProfile && (
           <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        My Eligibility Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                     {eligibilityDetails.isEligible ? (
                        <Badge className='text-base sm:text-lg gap-2 px-4 py-2 bg-green-100 text-green-800 hover:bg-green-100/90 dark:bg-green-900/30 dark:text-green-200'>
                            <CheckCircle className='h-5 w-5' />
                            Currently Eligible to Donate
                        </Badge>
                     ) : (
                        <Badge variant="destructive" className='text-base sm:text-lg gap-2 px-4 py-2'>
                           <AlertCircle className='h-5 w-5' />
                            Not Eligible to Donate
                        </Badge>
                     )}
                     {eligibilityDetails.nextEligibleDate && (
                         <div className='text-sm text-muted-foreground'>
                            Next eligible on: <span className='font-semibold text-foreground'>{format(eligibilityDetails.nextEligibleDate, 'PPP')}</span>
                         </div>
                     )}
                   </div>
                   {!eligibilityDetails.isEligible && eligibilityDetails.reasons.length > 0 && (
                        <div className="p-4 border-l-4 border-destructive bg-destructive/10 rounded-r-lg">
                            <h4 className="font-semibold mb-2">Reasons for Ineligibility:</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                {eligibilityDetails.reasons.map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                ))}
                            </ul>
                        </div>
                   )}
                </CardContent>
            </Card>
      )}

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
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateOfBirth && "text-muted-foreground"
                        )}
                        disabled={!isOwnProfile}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        captionLayout="dropdown-nav"
                        fromYear={1960}
                        toYear={new Date().getFullYear()}
                        selected={dateOfBirth}
                        onSelect={setDateOfBirth}
                        disabled={!isOwnProfile || ((date) => date > new Date() || date < new Date("1900-01-01"))}
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
              <MessageSquare className='h-6 w-6' />
              Social & Contact Links
          </CardTitle>
          <CardDescription>
             Add your contact details to connect with others.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input id="whatsapp" value={whatsapp || ''} onChange={(e) => setWhatsapp(e.target.value)} readOnly={!isOwnProfile}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram Username</Label>
                    <Input id="telegram" value={telegram || ''} onChange={(e) => setTelegram(e.target.value)} readOnly={!isOwnProfile}/>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="messenger">Facebook/Messenger Link</Label>
                <Input id="messenger" value={messenger || ''} onChange={(e) => setMessenger(e.target.value)} readOnly={!isOwnProfile} />
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
                <HeartPulse className="h-6 w-6" />
                Health & Eligibility
            </CardTitle>
            <CardDescription>
              {isOwnProfile ? "Provide your health information to help determine your donation eligibility." : "Health & eligibility information."}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="weight">Weight (KG)</Label>
                    <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} readOnly={!isOwnProfile} placeholder="e.g., 70" />
                </div>
                <div className="space-y-2">
                    <Label>Height</Label>
                    <div className="flex gap-2">
                        <Input type="number" value={height.feet || ''} onChange={(e) => setHeight(p => ({...p, feet: Number(e.target.value)}))} readOnly={!isOwnProfile} placeholder="Feet" />
                        <Input type="number" value={height.inches || ''} onChange={(e) => setHeight(p => ({...p, inches: Number(e.target.value)}))} readOnly={!isOwnProfile} placeholder="Inches" />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="medical-conditions">Medical Conditions</Label>
                <Textarea id="medical-conditions" value={medicalConditions} onChange={(e) => setMedicalConditions(e.target.value)} readOnly={!isOwnProfile} placeholder="e.g., Diabetes, High Blood Pressure. Leave blank if none." />
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="eligibility-status" checked={isEligible} onCheckedChange={setIsEligible} disabled={!isOwnProfile} />
                <Label htmlFor="eligibility-status">Are you currently eligible to donate blood?</Label>
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
        <div className="flex justify-end pb-8">
            <Button onClick={handleSaveChanges} disabled={isSaving} size="lg">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save All Changes
            </Button>
        </div>
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
