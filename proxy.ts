import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const basicAuth = request.headers.get('authorization');
  const cookie = request.cookies.get('admin_session');

  // =========================================================================
  // ۱. استثناهای خاص (بدون نیاز به لاگین)
  // =========================================================================
  if (url.pathname === '/api/admin/setup') {
    return NextResponse.next();
  }

  if (url.pathname === '/api/admin/review') {
    const internalAuth = request.headers.get('x-internal-bot-auth');
    if (internalAuth === process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.next();
    }
  }

  // =========================================================================
  // ۲. بررسی امنیتی مسیرهای ادمین
  // =========================================================================
  if (url.pathname.startsWith('/api/admin') || url.pathname.includes('/admin')) {
    
    // اگر کاربر لاگین است (کوکی دارد)
    if (cookie?.value === 'authenticated') {
      // 👈 بسیار مهم: اگر درخواست به API است، اصلاً آن را به intlMiddleware نده
      if (url.pathname.startsWith('/api/')) {
        return NextResponse.next();
      }
      return intlMiddleware(request);
    }

    // اگر درخواست لاگین (Basic Auth) داشت
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      try {
        const decoded = atob(authValue);
        const [user, pwd] = decoded.split(':');

        if (user === 'admin' && pwd === 'Parham@12345') { 
          // اگر لاگین موفق بود، کوکی ست کن
          if (url.pathname.startsWith('/api/')) {
            const response = NextResponse.next();
            response.cookies.set('admin_session', 'authenticated', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
            return response;
          }
          
          const response = intlMiddleware(request);
          response.cookies.set('admin_session', 'authenticated', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
          return response;
        }
      } catch (e) {}
    }

    // اگر هیچ کدام نبود، مسدود کن
    if (url.pathname.startsWith('/api/admin')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized access' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new NextResponse('Authentication Required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
    });
  }

  // =========================================================================
  // ۳. مسیرهای عمومی سایت
  // =========================================================================
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/api/admin/:path*']
};