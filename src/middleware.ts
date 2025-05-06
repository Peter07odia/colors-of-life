import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is logged in
  // This is a simplified version - in reality, you'd check authentication tokens
  const isAuthenticated = request.cookies.has('authenticated') || request.cookies.has('user');

  // Avoid infinite redirects by checking the URL
  // IMPORTANT: We only redirect from / to /dashboard ONCE
  if (request.nextUrl.pathname === '/' && isAuthenticated) {
    const url = request.nextUrl.clone();
    
    // Check if we're already being redirected to avoid loops
    const isRedirecting = request.headers.get('x-middleware-rewrite') || 
                          request.headers.get('x-middleware-next') ||
                          url.searchParams.has('_redirected');
                          
    if (!isRedirecting) {
      url.pathname = '/dashboard';
      url.searchParams.set('_redirected', 'true');
      return NextResponse.redirect(url);
    }
  }

  // If trying to access protected pages when not authenticated, redirect to login
  if (!isAuthenticated && 
      (request.nextUrl.pathname === '/dashboard' || 
       request.nextUrl.pathname.startsWith('/ai-stylist') || 
       request.nextUrl.pathname.startsWith('/try-on') || 
       request.nextUrl.pathname.startsWith('/profile') || 
       request.nextUrl.pathname.startsWith('/cart'))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard', '/ai-stylist/:path*', '/try-on/:path*', '/profile/:path*', '/cart/:path*'],
}; 