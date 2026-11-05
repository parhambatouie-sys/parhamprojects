import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const basicAuth = request.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // ⚠️ نام کاربری و رمز عبور خود را اینجا تنظیم کنید
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'Parham@12345'; 

    if (user === ADMIN_USER && pwd === ADMIN_PASS) {
      return NextResponse.next();
    }
  }

  // اگر درخواست به API ادمین بود، خطای JSON بده (بدون باز کردن پاپ‌آپ)
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized access to admin API' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // اگر درخواست به صفحات ادمین بود، پنجره لاگین باز کن
  return new NextResponse('Authentication Required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
  });
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/:locale/admin/:path*'
  ],
};