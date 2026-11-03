import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// این خط کار سیستم دوزبانه رو انجام میده (ریدایرکت کردن / به /fa)
const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ۱. چک کردن امنیت پنل ادمین
  const isAdminPath = pathname.includes("/admin") && !pathname.includes("/admin/login");

  if (isAdminPath) {
    const basicAuth = request.headers.get("authorization");

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");

      if (
        user === process.env.BASIC_AUTH_USER &&
        pwd === process.env.BASIC_AUTH_PASSWORD
      ) {
        // اگر رمز درست بود، بذار بره داخل
        return intlMiddleware(request); 
      }
    }

    // اگر رمز اشتباه بود یا وارد نشده بود
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Panel"',
      },
    });
  }

  // ۲. برای بقیه صفحات، کارهای دوزبانه رو انجام بده
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};