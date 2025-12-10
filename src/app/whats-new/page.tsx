import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Gem, HandHeart } from 'lucide-react';

const updates = [
    {
        date: 'July 29, 2024',
        title: 'Goal Achieved: Winter Clothing Drive!',
        description: 'Amazing news! Thanks to your incredible generosity, the Winter Clothing Drive has successfully reached its goal of ৳50,000. This means hundreds of warm clothing kits will be distributed to families in need. Thank you for making a difference!',
        icon: HandHeart,
        tag: 'Goal Achieved'
    },
    {
        date: 'July 28, 2024',
        title: 'New Feature: Comprehensive Donation System',
        description: 'We are thrilled to launch our brand new donation system! You can now support various campaigns, track your contributions, and see the impact you are making in real-time. This system includes dynamic campaign pages, a secure donation process, and automated invoice generation.',
        icon: Rocket,
        tag: 'New'
    },
    {
        date: 'July 27, 2024',
        title: 'Enhancement: User & Admin Dashboards',
        description: 'Personalized dashboards are now live for all users and admins. Users can view their donation history, while admins get a powerful interface to manage users, review profiles, and oversee campaigns.',
        icon: Gem,
        tag: 'Improvement'
    },
    {
        date: 'July 25, 2024',
        title: 'Platform Launch: Welcome to the New Ecosystem',
        description: 'The initial version of the Prangon\'s Ecosystem is now live! Explore the blog, browse projects, and get in touch. This is just the beginning of our journey to build a comprehensive digital platform.',
        icon: Rocket,
        tag: 'Launch'
    },
];

export default function WhatsNewPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center px-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          What's New
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Check out the latest features, updates, and improvements to the platform.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-border"></div>
        
        <div className="space-y-12">
            {updates.map((update, index) => (
                <div key={index} className="relative flex items-start">
                    <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 z-10">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary ring-4 ring-background">
                            <update.icon className="h-4 w-4 text-primary-foreground" />
                        </div>
                    </div>
                    <Card className={`w-full ${index % 2 === 0 ? 'mr-auto' : 'ml-auto'} max-w-sm`}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">{update.date}</p>
                                <Badge variant={update.tag === 'New' ? 'default' : update.tag === 'Goal Achieved' ? 'secondary' : 'outline'}>{update.tag}</Badge>
                            </div>
                            <CardTitle className="font-headline pt-2">{update.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{update.description}</CardDescription>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
