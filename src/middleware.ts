// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

/** Канонический хост из env (любой из переменных; можно задать просто host или URL) */
function getExpectedHost(): string | null {
  const raw =
    process.env.CANONICAL_HOST ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    null;

  if (!raw) return null;

  try {
    // Если пришёл полноценный URL — берём host
    return new URL(raw).host;
  } catch {
    // Если пришёл просто host (без протокола) — возвращаем как есть
    return raw;
  }
}

/** Унифицированное чтение JWT для v4/v5 (разные cookie имена) */
async function readAuthToken(req: NextRequest): Promise<JWT | null> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  let token = await getToken({ req, secret }); // v4 (или дефолт v5)
  token ??= await getToken({ req, secret, cookieName: "authjs.session-token" }); // v5
  token ??= await getToken({
    req,
    secret,
    cookieName: "__Secure-authjs.session-token",
  }); // v5 (secure cookie)

  return token;
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const { pathname, search } = url;

  // 0) Канонический домен (не трогаем API, чтобы не ломать вебхуки и next-auth callbacks)
  const expectedHost = getExpectedHost();
  if (
    expectedHost &&
    url.hostname !== expectedHost &&
    !pathname.startsWith("/api")
  ) {
    url.hostname = expectedHost;
    return NextResponse.redirect(url, 308);
  }

  const token = await readAuthToken(req);

  // 1) Auth-страницы: если уже вошли — отправим на callbackUrl или /orders
  if (pathname.startsWith("/auth")) {
    if (token) {
      const cb = req.nextUrl.searchParams.get("callbackUrl") ?? "/orders";
      const target = new URL(cb, req.nextUrl.origin);
      return NextResponse.redirect(target);
    }
    return NextResponse.next();
  }

  // 2) Админка — только для ADMIN_EMAIL
  if (pathname.startsWith("/admin")) {
    const admin = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
    const email = (token?.email ?? "").toLowerCase();

    if (!token) {
      const signin = req.nextUrl.clone();
      signin.pathname = "/auth/signin";
      signin.search = new URLSearchParams({
        callbackUrl: "/admin/orders",
      }).toString();
      return NextResponse.redirect(signin);
    }

    if (!admin || email !== admin) {
      const home = req.nextUrl.clone();
      home.pathname = "/";
      home.search = "";
      return NextResponse.redirect(home);
    }

    return NextResponse.next();
  }

  // 3) Приватные страницы для пользователя
  const isProtected =
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/account");

  if (isProtected && !token) {
    const signin = req.nextUrl.clone();
    signin.pathname = "/auth/signin";
    signin.search = new URLSearchParams({
      callbackUrl: `${pathname}${search}`,
    }).toString();
    return NextResponse.redirect(signin);
  }

  return NextResponse.next();
}

/**
 * Матчер:
 *  - работаем на всех страницах (для канонического домена),
 *  - исключаем статику и служебные файлы,
 *  - API не трогаем (особенно /api/auth/*).
 */
export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)).*)",
  ],
};
