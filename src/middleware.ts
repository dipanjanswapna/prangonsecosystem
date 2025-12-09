
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth, adminFirestore } from '@/lib/firebase-admin';
import { roleHierarchy, ROLES } from './lib/roles';

// Force the middleware to run on the Node.js runtime
export const runtime = 'nodejs';

const protectedRoutes: Record<string, number> = {
    '/dashboard': roleHierarchy[ROLES.USER],
    '/auth/profile': roleHierarchy[ROLES.USER],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiredRoleLevel = Object.entries(protectedRoutes).find(([path]) =>
    pathname.startsWith(path)
  )?.[1];

  // If the route is not a protected dashboard route, do nothing.
  if (requiredRoleLevel === undefined) {
    return NextResponse.next();
  }

  // Get the session cookie
  const sessionCookie = request.cookies.get('__session')?.value;

  if (!sessionCookie) {
    // If no session cookie, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify the session cookie
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userUid = decodedToken.uid;

    // Get user role from Firestore
    const userDoc = await adminFirestore.collection('users').doc(userUid).get();
    if (!userDoc.exists) {
      throw new Error('User not found in Firestore.');
    }

    const userData = userDoc.data();
    const userRole = userData?.role || ROLES.USER;
    const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? 0;

    // Check if the user has the required role level (or higher)
    if (userRoleLevel >= requiredRoleLevel) {
      // User is authorized, continue to the requested page
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-role', userRole);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } else {
      // User is not authorized, redirect to login (or a dedicated 'unauthorized' page)
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } catch (error) {
    console.error('Middleware Error:', error);
    // If cookie is invalid or any other error, redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    // Clear the invalid cookie
    response.cookies.delete('__session');
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/profile'],
};
