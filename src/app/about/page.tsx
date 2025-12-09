import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {
    const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
    
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-shrink-0">
          <Avatar className="h-40 w-40 md:h-48 md:w-48 border-4 border-primary/20 shadow-lg">
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Dipanjan S. PRANGON" />}
            <AvatarFallback className="text-4xl">DD</AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center md:text-left">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">
            Dipanjan S. PRANGON
          </h1>
          <p className="mt-2 text-xl text-muted-foreground font-medium">
            Full-Stack Developer, UI/UX Enthusiast, and Content Creator.
          </p>
        </div>
      </div>
      <div className="prose prose-lg dark:prose-invert max-w-full mx-auto text-foreground/80">
        <p>
          Hello! I'm Dipanjan, a passionate developer and designer with a knack for building beautiful, functional, and user-centric digital experiences. My journey into the world of tech began with a fascination for how things work, which quickly blossomed into a career dedicated to creating innovative solutions on the web.
        </p>
        <p>
          With a strong foundation in both front-end and back-end technologies, I specialize in bringing ideas to life from concept to deployment. I thrive on challenges and am constantly exploring new technologies to push the boundaries of what's possible.
        </p>
        <h2 className="font-headline">My Philosophy</h2>
        <p>
          I believe that the best products are born from a deep understanding of user needs, coupled with clean, efficient code and elegant design. My goal is to not just build applications, but to craft experiences that are intuitive, accessible, and enjoyable for everyone.
        </p>
        <h2 className="font-headline">Beyond the Code</h2>
        <p>
          When I'm not at my keyboard, you can find me exploring the latest design trends, contributing to open-source projects, or sharing my knowledge through my blog. I'm also a firm believer in giving back to the community and am actively involved in mentoring aspiring developers.
        </p>
      </div>
    </div>
  );
}
