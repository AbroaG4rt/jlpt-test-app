import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/';

  // Protect test and result routes natively
  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/test') || path.startsWith('/result');

  // Verify session securely using jose via our auth helper
  // For middleware, we can just check if cookie exists. Real validation happens soon.
  const token = request.cookies.get('session')?.value;
  
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Call update session to keep the session alive
  return await updateSession(request) ?? NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
