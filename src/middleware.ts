import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to handle multi-subdomain authentication flow
 *
 * Flow:
 * 1. User visits {org}.uchhal.in/ → clicks login
 * 2. Redirects to auth.uchhal.in for Auth0 authentication
 * 3. After successful auth, AuthHandler redirects back to {user-org}.uchhal.in/dashboard
 */
export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  // Get protocol based on environment
  const isLocalhost =
    hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const protocol = isLocalhost ? 'http' : 'https';

  console.log('🔒 Middleware:', {
    pathname,
    hostname,
    subdomain,
    origin,
  });

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // If user is trying to access /login directly on non-auth subdomain, redirect to auth subdomain
  if (pathname === '/login' && subdomain !== 'auth') {
    const port = hostname.includes(':') ? `:${hostname.split(':')[1]}` : '';
    const baseDomain = hostname.split('.').slice(1).join('.');
    const authUrl = isLocalhost
      ? `${protocol}://auth.localhost${port}/login`
      : `${protocol}://auth.${baseDomain}/login`;

    console.log('🔐 Redirecting login to auth subdomain:', authUrl);
    return NextResponse.redirect(authUrl);
  }

  // If user is on auth subdomain trying to access protected routes, redirect to login
  if (subdomain === 'auth' && pathname.startsWith('/dashboard')) {
    console.log(
      '⚠️ Cannot access dashboard on auth subdomain, redirecting to login',
    );
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
