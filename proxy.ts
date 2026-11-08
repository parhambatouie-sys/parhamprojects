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
  // 🟢 استثنا برای ربات تلگرام: اجازه دادن به مسیر بررسی جمینای
  // =========================================================================
  if (url.pathname === '/api/admin/review') {
    // بررسی اینکه آیا درخواست از سمت ربات (با هدر مخفی) ارسال شده است یا خیر
    const internalAuth = request.headers.get('x-internal-bot-auth');
    if (internalAuth === process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.next(); // به ربات اجازه عبور بده
    }
  }

  // =========================================================================
  // بررسی امنیتی مسیرهای ادمین
  // =========================================================================
  if (url.pathname.startsWith('/api/admin') || url.pathname.includes('/admin')) {
    
    // ۱. اگر کوکی معتبر داشت، بگذار وارد شود
    if (cookie?.value === 'authenticated') {
      return intlMiddleware(request);
    }

    // ۲. اگر درخواست لاگین (Basic Auth) داشت
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      try {
        const decoded = atob(authValue);
        const [user, pwd] = decoded.split(':');

        // ⚠️ نام کاربری و رمز عبور خودتان
        if (user === 'admin' && pwd === 'Parham@12345') { 
          const response = intlMiddleware(request);
          response.cookies.set('admin_session', 'authenticated', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
          return response;
        }
      } catch (e) {}
    }

    // ۳. اگر هیچ کدام نبود، مسدود کن
    if (url.pathname.startsWith('/api/admin')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized access to admin API' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new NextResponse('Authentication Required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
    });
  }

  // مسیرهای عمومی سایت
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/api/admin/:path*']
};