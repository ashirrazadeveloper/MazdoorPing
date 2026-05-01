import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/register'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith('/api/'));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;

    if (pathname.startsWith('/worker') && role !== 'worker') {
      return NextResponse.redirect(new URL(role === 'employer' ? '/employer' : role === 'admin' ? '/admin' : '/', request.url));
    }
    if (pathname.startsWith('/employer') && role !== 'employer') {
      return NextResponse.redirect(new URL(role === 'worker' ? '/worker' : role === 'admin' ? '/admin' : '/', request.url));
    }
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(role === 'worker' ? '/worker' : role === 'employer' ? '/employer' : '/', request.url));
    }

    if ((pathname === '/login' || pathname === '/register') && role) {
      const redirectPath = role === 'worker' ? '/worker' : role === 'employer' ? '/employer' : role === 'admin' ? '/admin' : '/';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)'],
};
