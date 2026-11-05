import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // ⚠️ نام کاربری و رمز عبور شما
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'Parham@12345'; 

    if (user === ADMIN_USER && pwd === ADMIN_PASS) {
      return NextResponse.next();
    }
  }

  // اگر رمز اشتباه بود یا وارد نشده بود، مرورگر پنجره لاگین را نشان می‌دهد
  return new NextResponse('Authentication Required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
  });
}

// این مسیرها قفل می‌شوند (پنل ادمین و APIهای ادمین)
export const config = {
  matcher: [
    '/api/admin/:path*',
    '/:locale/admin/:path*'
  ],
};