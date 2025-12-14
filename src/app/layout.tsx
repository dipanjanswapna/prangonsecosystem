
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/context/theme-provider';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { FirebaseClientProviderWrapper } from '@/firebase/client-provider-wrapper';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { DynamicStatusBar } from '@/components/dynamic-status-bar';
import { HeroSection } from './page';

// export const metadata: Metadata = {
//   title: 'Prangons Ecosystem',
//   description: "Dipanjan's personal ecosystem for work, thoughts, and creativity.",
// };

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isDashboardPage = pathname.startsWith('/dashboard');
  const isAuthPage = pathname.startsWith('/auth');
  const isHomePage = pathname === '/';
  const showHeaderFooter = !isDashboardPage && !isAuthPage;

  if (!isClient) {
    // You can return a loading skeleton here if you want
    return null; 
  }

  return (
    <>
      <DynamicStatusBar />
      {showHeaderFooter && <AppHeader />}
      {isHomePage && <HeroSection />}
      <main className="flex-1 container px-4 md:px-6 lg:px-8">
        <div className={cn(!isDashboardPage && !isAuthPage && !isHomePage && "py-8")}>
         {children}
        </div>
      </main>
      {showHeaderFooter && <AppFooter />}
      <Toaster />
    </>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
         <title>Prangons Ecosystem</title>
        <meta name="description" content="Dipanjan's personal ecosystem for work, thoughts, and creativity." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProviderWrapper>
            <RootLayoutContent>{children}</RootLayoutContent>
          </FirebaseClientProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
