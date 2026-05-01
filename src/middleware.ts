import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith('/api/'));

  // Check if Supabase is properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseConfigured = Boolean(
    supabaseUrl &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('placeholder')
  );

  // If Supabase not configured, allow all pages
  if (!supabaseConfigured) {
    return NextResponse.next();
  }

  // Check if user has ANY Supabase auth cookie (instant, NO network call)
  const cookies = request.cookies.getAll();
  const hasAuthCookie = cookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  );

  if (hasAuthCookie) {
    // User is authenticated - let them through to any page
    // Don't redirect from login/register here - let the client handle it
    return NextResponse.next();
  }

  // No auth cookie - user is not logged in
  if (!isPublicPath) {
    // Only redirect to login for protected paths (/worker, /employer, /admin)
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Public path + not logged in - show the page normally
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)'],
};
