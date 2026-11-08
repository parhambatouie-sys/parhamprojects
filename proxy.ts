import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const basicAuth = request.headers.get('authorization');
  const cookie = request.cookies.get('admin_session');

  if (url.pathname.startsWith('/api/admin') || url.pathname.includes('/admin')) {
    if (cookie?.value === 'authenticated') {
      return intlMiddleware(request);
    }

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      try {
        const decoded = atob(authValue);
        const [user, pwd] = decoded.split(':');
        if (user === 'admin' && pwd === 'Parham@12345') { 
          const response = intlMiddleware(request);
          response.cookies.set('admin_session', 'authenticated', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
          return response;
        }
      } catch (e) {}
    }

    if (url.pathname.startsWith('/api/admin')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized access to admin API' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new NextResponse('Authentication Required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
    });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/api/admin/:path*']
};