import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

async function readAuthToken(req: NextRequest): Promise<JWT | null> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  let token = await getToken({ req, secret }); // v4
  token ??= await getToken({ req, secret, cookieName: "authjs.session-token" }); // v5
  token ??= await getToken({ req, secret, cookieName: "__Secure-authjs.session-token" }); // v5 (secure)
  return token;
}

function safeInternalCallback(req: NextRequest, fallback = "/orders") {
  const cb = req.nextUrl.searchParams.get("callbackUrl");
  if (!cb) return fallback;
  try {
    const u = new URL(cb, req.nextUrl.origin);
    // только свой origin и относительные пути
    if (u.origin === req.nextUrl.origin && u.pathname.startsWith("/")) {
      // запрещаем возвращаться на /auth/*
      if (!u.pathname.startsWith("/auth")) return u.pathname + u.search;
    }
  } catch {}
  return fallback;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Служебные пути — пропускаем
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const token = await readAuthToken(req);

  // Страницы авторизации
  if (pathname.startsWith("/auth")) {
    if (token?.email) {
      const target = safeInternalCallback(req, "/orders");
      return NextResponse.redirect(new URL(target, url.origin));
    }
    return NextResponse.next();
  }

  // Админка
  if (pathname.startsWith("/admin")) {
    if (!token?.email) {
      const login = new URL("/auth/signin", url.origin);
      login.searchParams.set("callbackUrl", pathname + url.search);
      return NextResponse.redirect(login);
    }
    const admin = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
    const email = (token.email ?? "").toLowerCase();
    if (!admin || email !== admin) {
      return NextResponse.redirect(new URL("/", url.origin));
    }
    return NextResponse.next();
  }

  // Приватные страницы
  const protectedPrefixes = ["/orders", "/profile", "/account"];
  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (!token?.email) {
      const login = new URL("/auth/signin", url.origin);
      login.searchParams.set("callbackUrl", pathname + url.search);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/health|api/webhooks|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
