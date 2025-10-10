// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Унифицированное чтение токена для v4/v5 (разные cookies)
async function readAuthToken(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  // next-auth v4
  let token = await getToken({ req, secret });
  // auth.js / next-auth v5
  if (!token) token = await getToken({ req, secret, cookieName: "authjs.session-token" });
  // вариант с __Secure- (на https и некоторых хостингах)
  if (!token) token = await getToken({ req, secret, cookieName: "__Secure-authjs.session-token" });

  return token;
}

export async function middleware(req: NextRequest) {
  const token = await readAuthToken(req);
  const { pathname } = req.nextUrl;

  // /auth/* — если уже залогинен, уводим на callbackUrl или /orders
  if (pathname.startsWith("/auth")) {
    if (token) {
      const url = req.nextUrl.clone();
      const cb = req.nextUrl.searchParams.get("callbackUrl");
      url.pathname = cb ?? "/orders";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // /admin/* — только админ по email
  if (pathname.startsWith("/admin")) {
    const admin = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
    const email = String((token as any)?.email ?? "").toLowerCase();

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.search = new URLSearchParams({ callbackUrl: "/admin/orders" }).toString();
      return NextResponse.redirect(url);
    }

    if (!admin || email !== admin) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Приватные страницы для пользователя
  const isProtected =
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/account");

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    const returnTo = `${pathname}${req.nextUrl.search}`;
    url.search = new URLSearchParams({ callbackUrl: returnTo }).toString();
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/orders/:path*", "/profile/:path*", "/account/:path*", "/admin/:path*"],
};
