import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/register'];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith('/api/'));

  if (!session && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const role = profile?.role;

    // Protect role-based routes
    if (pathname.startsWith('/worker') && role !== 'worker') {
      return NextResponse.redirect(new URL(role === 'employer' ? '/employer' : role === 'admin' ? '/admin' : '/', request.url));
    }
    if (pathname.startsWith('/employer') && role !== 'employer') {
      return NextResponse.redirect(new URL(role === 'worker' ? '/worker' : role === 'admin' ? '/admin' : '/', request.url));
    }
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(role === 'worker' ? '/worker' : role === 'employer' ? '/employer' : '/', request.url));
    }

    // Redirect logged-in users from login/register
    if ((pathname === '/login' || pathname === '/register') && role) {
      const redirectPath = role === 'worker' ? '/worker' : role === 'employer' ? '/employer' : role === 'admin' ? '/admin' : '/';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)'],
};
