import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is currently disabled to rely on client-side auth checks.
// You can re-enable it if you implement a robust server-side session verification.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Do not run middleware on any routes for now
  matcher: [],
};
