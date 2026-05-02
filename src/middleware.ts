import { NextResponse, type NextRequest } from 'next/server';

// Middleware is now PASSTHROUGH only.
// All auth protection is handled client-side by AuthGuard component.
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)'],
};
