import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/register'];

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url && key &&
    !url.includes('your-project') &&
    !url.includes('placeholder') &&
    key !== 'your-anon-key' &&
    key !== 'placeholder'
  );
}

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith('/api/'));

  // If Supabase is not configured, allow ALL pages
  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Use getSession (reads from cookies, NO network call) with timeout
    const sessionResult = await Promise.race<any>([
      supabase.auth.getSession(),
      new Promise<any>((resolve) => setTimeout(() => resolve({ data: { session: null } }), 3000))
    ]);
    const session = sessionResult?.data?.session || null;

    if (!session?.user && !isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (session?.user) {
      try {
        const profileResult = await Promise.race<any>([
          supabase.from('profiles').select('role').eq('id', session.user.id).single(),
          new Promise<any>((resolve) => setTimeout(() => resolve({ data: null }), 3000))
        ]);

        const role = profileResult?.data?.role;

        if (role) {
          if (pathname.startsWith('/worker') && role !== 'worker') {
            return NextResponse.redirect(new URL(role === 'employer' ? '/employer' : role === 'admin' ? '/admin' : '/', request.url));
          }
          if (pathname.startsWith('/employer') && role !== 'employer') {
            return NextResponse.redirect(new URL(role === 'worker' ? '/worker' : role === 'admin' ? '/admin' : '/', request.url));
          }
          if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL(role === 'worker' ? '/worker' : role === 'employer' ? '/employer' : '/', request.url));
          }
          if ((pathname === '/login' || pathname === '/register')) {
            const redirectPath = role === 'worker' ? '/worker' : role === 'employer' ? '/employer' : role === 'admin' ? '/admin' : '/';
            return NextResponse.redirect(new URL(redirectPath, request.url));
          }
        }
      } catch {
        // Profile fetch failed, let user through
      }
    }
  } catch {
    // Any error - just let the request pass through
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)'],
};
