import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // بررسی اینکه آیا درخواست مربوط به مسیرهای ادمین API است یا خیر
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // ورسل پس از لاگین موفق، یک کوکی به نام _vercel_jwt تنظیم می‌کند
    const vercelAuthCookie = request.cookies.get('_vercel_jwt');
    
    // اگر کوکی وجود نداشت، یعنی کاربر لاگین نکرده است
    if (!vercelAuthCookie) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized access to admin API' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  return NextResponse.next();
}

// فقط برای این مسیرها اجرا شود
export const config = {
  matcher: '/api/admin/:path*',
};