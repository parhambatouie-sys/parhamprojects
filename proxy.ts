import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // چک میکنه که آیا مسیر شامل /admin هست (چه /fa/admin چه /en/admin) و صفحه لاگین نباشه
  const isAdminPath = pathname.includes("/admin") && !pathname.includes("/admin/login");

  if (isAdminPath) {
    const basicAuth = request.headers.get("authorization");

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");

      const validUser = process.env.BASIC_AUTH_USER;
      const validPassWord = process.env.BASIC_AUTH_PASSWORD;

      if (user === validUser && pwd === validPassWord) {
        return NextResponse.next();
      }
    }

    // اگر رمز اشتباه بود یا وارد نشده بود، پنجره لاگین باز میشه
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Panel"',
      },
    });
  }

  return NextResponse.next();
}

// این ماتcher میگه این کد روی تمام صفحاتی که فایل استاتیک نیستن اجرا بشه
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};