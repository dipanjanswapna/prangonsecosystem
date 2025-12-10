import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

// This middleware is currently disabled to rely on client-side auth checks.
// You can re-enable it if you implement a robust server-side session verification.
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session')?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify the session cookie on the server.
    await adminAuth.verifySessionCookie(sessionCookie, true);
    // The cookie is valid. Allow the request to proceed.
    return NextResponse.next();
  } catch (error) {
    // Session cookie is invalid. Redirect to login page.
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    // Clear the invalid cookie
    response.cookies.set('__session', '', { maxAge: -1 });
    return response;
  }
}

export const config = {
  // Protect all routes under /dashboard and /auth/profile
  matcher: ['/dashboard/:path*', '/auth/profile'],
};
