// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

// Унифицированное чтение токена (v4/v5 — разные cookie имена)
async function readAuthToken(req: NextRequest): Promise<JWT | null> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  let token = await getToken({ req, secret }); // next-auth v4
  token ??= await getToken({ req, secret, cookieName: "authjs.session-token" }); // v5
  token ??= await getToken({
    req,
    secret,
    cookieName: "__Secure-authjs.session-token",
  }); // v5 (secure-cookie variant)

  return token;
}

export async function middleware(req: NextRequest) {
  const token = await readAuthToken(req);
  const { pathname } = req.nextUrl;

  // Страницы /auth/*
  if (pathname.startsWith("/auth")) {
    if (token) {
      const cb = req.nextUrl.searchParams.get("callbackUrl") ?? "/orders";
      const target = new URL(cb, req.nextUrl.origin);
      return NextResponse.redirect(target);
    }
    return NextResponse.next();
  }

  // /admin/* — только для ADMIN_EMAIL
  if (pathname.startsWith("/admin")) {
    const admin = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
    const rawEmail = token?.email;
    const email = typeof rawEmail === "string" ? rawEmail.toLowerCase() : "";

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
    url.search = new URLSearchParams({
      callbackUrl: `${pathname}${req.nextUrl.search}`,
    }).toString();
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/orders/:path*", "/profile/:path*", "/account/:path*", "/admin/:path*"],
};
