import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // چک میکنه که آیا آدرس شامل /admin هست یا نه
  const isAdminPath = pathname.includes("/admin") && !pathname.includes("/admin/login");

  if (isAdminPath) {
    const basicAuth = request.headers.get("authorization");

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");

      // بررسی یوزر و پسورد با متغیرهای محیطی
      if (
        user === process.env.BASIC_AUTH_USER &&
        pwd === process.env.BASIC_AUTH_PASSWORD
      ) {
        // اگر درست بود، اجازه بده وارد بشه
        return intlMiddleware(request);
      }
    }

    // اگر رمز اشتباه بود، ارور 401 بده تا مرورگر پنجره لاگین رو باز کنه
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Admin"',
      },
    });
  }

  // برای بقیه صفحات، سیستم دوزبانه کار خودش رو بکنه
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};