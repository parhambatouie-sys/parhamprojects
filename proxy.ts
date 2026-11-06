import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const basicAuth = request.headers.get('authorization');
  const cookie = request.cookies.get('admin_session');

  // ۱. اگر کوکی معتبر داشت، بگذار وارد شود
  if (cookie?.value === 'authenticated') {
    return NextResponse.next();
  }

  // ۲. اگر درخواست لاگین (Basic Auth) داشت
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    try {
      const decoded = atob(authValue);
      const [user, pwd] = decoded.split(':');

      // ⚠️ نام کاربری و رمز عبور خودتان را اینجا تنظیم کنید
      if (user === 'batouie' && pwd === 'parhambatouiie832004') {
        const response = NextResponse.next();
        response.cookies.set('admin_session', 'authenticated', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // ۱ هفته اعتبار
        });
        return response;
      }
    } catch (e) {}
  }

  // ۳. اگر هیچ کدام نبود، مسدود کن
  if (url.pathname.startsWith('/api/admin')) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized access to admin API' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new NextResponse('Authentication Required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
  });
}

export const config = {
  matcher: ['/api/admin/:path*', '/:locale/admin/:path*', '/:locale/admin'],
};