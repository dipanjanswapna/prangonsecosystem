
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { roleHierarchy, ROLES } from './lib/roles';

// Force the middleware to run on the Node.js runtime
export const runtime = 'nodejs';

// A helper function to initialize Firebase Admin SDK.
// This ensures that initialization is attempted only once.
function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error('Firebase admin environment variables are not set.');
  }
  
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  });
}

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
    const adminApp = getFirebaseAdminApp();
    const adminAuth = getAuth(adminApp);
    const firestore = getFirestore(adminApp);
    
    // Verify the session cookie
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userUid = decodedToken.uid;

    // Get user role from Firestore
    const userDoc = await firestore.collection('users').doc(userUid).get();
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
