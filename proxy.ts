import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const basicAuth = request.headers.get('authorization');

  let isAuthorized = false;

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    try {
      const decoded = atob(authValue);
      const [user, pwd] = decoded.split(':');
      
      // ⚠️ نام کاربری و رمز عبور
      if (user === 'batouie' && pwd === 'parhambatouiie832004') {
        isAuthorized = true;
      }
    } catch (e) {
      // اگر دیکد کردن Base64 خطا داد
    }
  }

  // اگر رمز درست بود، اجازه عبور بده
  if (isAuthorized) {
    return NextResponse.next();
  }

  // اگر رمز اشتباه بود یا وارد نشده بود:
  // ۱. برای APIها خطای JSON بده (تا امنیت ۱۰۰٪ شود)
  if (url.pathname.startsWith('/api/admin')) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized access to admin API' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ۲. برای صفحات ادمین، پنجره لاگین مرورگر را باز کن
  return new NextResponse('Authentication Required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
  });
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/:locale/admin/:path*',
    '/:locale/admin',
  ],
};