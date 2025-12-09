import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/context/theme-provider';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Prangons Ecosystem',
  description: "Dipanjan's personal ecosystem for work, thoughts, and creativity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const heads = headers();
  const pathname = heads.get('next-url') || '';
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {isDashboard ? (
              <div className="flex min-h-screen flex-col">{children}</div>
            ) : (
              <div className="flex min-h-screen flex-col animated-gradient">
                <AppHeader />
                <main className="flex-1">
                  <div className={'container py-8 md:py-12'}>
                    {children}
                  </div>
                </main>
                <AppFooter />
              </div>
            )}
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
