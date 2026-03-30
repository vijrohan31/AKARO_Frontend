import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = request.cookies;
  
  const hasSession = cookieStore.getAll().some(c => 
    !['next-themes', 'header-state'].includes(c.name)
  );
  

  const publicRoutes = [
    '/login', 
    '/signup', 
    '/forgot-password', 
    '/verify_email',
    '/verify-email', 
    '/dashboard/verify_email'
  ];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  if (!isPublicRoute && !hasSession && pathname !== '/') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('expired', 'true');
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|avatars|logo|favicon.ico|sitemap.xml|robots.txt).*)'],
};
