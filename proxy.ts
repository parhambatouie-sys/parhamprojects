import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
        return intlMiddleware(request);
      }
    }

    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Admin"',
      },
    });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};