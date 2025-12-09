
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  });
}

const adminAuth = getAuth();

// Function to create a session cookie
export async function POST(request: Request) {
  try {
    const { idToken, rememberMe } = await request.json();
    
    // Set session expiration.
    // 14 days for "Remember me", 24 hours otherwise.
    const expiresIn = rememberMe
      ? 60 * 60 * 24 * 14 * 1000 // 14 days
      : 60 * 60 * 24 * 1 * 1000; // 1 day

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = {
      name: '__session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    };

    const response = NextResponse.json({ status: 'success' });
    response.cookies.set(options);
    
    return response;

  } catch (error) {
    console.error('Session Login Error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to create session' }, { status: 401 });
  }
}

// Function to clear the session cookie (logout)
export async function DELETE() {
  try {
    const options = {
      name: '__session',
      value: '',
      maxAge: -1, // Expire the cookie immediately
    };
    
    const response = NextResponse.json({ status: 'success' });
    response.cookies.set(options);
    
    return response;

  } catch (error) {
    console.error('Session Logout Error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to clear session' }, { status: 500 });
  }
}
