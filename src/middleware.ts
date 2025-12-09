
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth, adminFirestore } from '@/lib/firebase-admin';
import { roleHierarchy, ROLES } from './lib/roles';

export const runtime = 'nodejs';

const protectedRoutes: Record<string, number> = {
  '/dashboard': roleHierarchy[ROLES.USER],
  '/dashboard/admin': roleHierarchy[ROLES.ADMIN],
  '/dashboard/moderator': roleHierarchy[ROLES.MODERATOR],
  '/dashboard/manager': roleHierarchy[ROLES.MANAGER],
  '/dashboard/collaborator': roleHierarchy[ROLES.COLLABORATOR],
  '/dashboard/user': roleHierarchy[ROLES.USER],
  '/auth/profile': roleHierarchy[ROLES.USER],
  '/dashboard/all-users': roleHierarchy[ROLES.ADMIN],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiredRoleLevel = Object.entries(protectedRoutes).find(([path]) =>
    pathname.startsWith(path)
  )?.[1];

  // If the route is not protected, continue.
  if (requiredRoleLevel === undefined) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('__session')?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userUid = decodedToken.uid;

    const userDoc = await adminFirestore.collection('users').doc(userUid).get();
    
    if (!userDoc.exists) {
      throw new Error('User not found in Firestore.');
    }

    const userData = userDoc.data();
    const userRole = userData?.role || ROLES.USER;
    const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? 0;

    // If user has sufficient role level, allow access
    if (userRoleLevel >= requiredRoleLevel) {
      return NextResponse.next();
    } else {
        // If user is trying to access a protected dashboard page they don't have access to,
        // redirect them to their own role's dashboard.
        return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, request.url));
    }
  } catch (error) {
    console.error('Middleware Error:', error);
    // If token verification fails, clear the cookie and redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('__session');
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/profile'],
};
