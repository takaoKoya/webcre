import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/create'];

// Paths only for unauthenticated users
const AUTH_PATHS = ['/auth/login', '/auth/signup'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if Supabase is configured
  // In dev mode (no Supabase keys), we allow all access
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const isDev = !supabaseUrl || supabaseUrl.includes('dummy') || supabaseUrl.includes('placeholder');

  if (isDev) {
    return NextResponse.next();
  }

  // Check for auth session cookie
  const authCookie =
    request.cookies.get('sb-access-token') ||
    request.cookies.get('sb-refresh-token') ||
    // Supabase v2 cookie format
    [...request.cookies.getAll()].find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

  const isAuthenticated = !!authCookie;
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
