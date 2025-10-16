import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

/** читаем JWT из cookie (Auth.js v4/v5) */
async function readAuthToken(req: NextRequest): Promise<JWT | null> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  let token = await getToken({ req, secret }); // v4
  token ??= await getToken({ req, secret, cookieName: "authjs.session-token" }); // v5
  token ??= await getToken({ req, secret, cookieName: "__Secure-authjs.session-token" }); // v5 (secure)
  return token;
}

/** безопасный callbackUrl внутри нашего origin */
function safeInternalCallback(req: NextRequest, fallback = "/orders") {
  const cb = req.nextUrl.searchParams.get("callbackUrl");
  if (!cb) return fallback;

  try {
    const base = new URL(req.url);
    const u = new URL(cb, base);
    if (u.origin === base.origin && u.pathname.startsWith("/") && !u.pathname.startsWith("/auth")) {
      return u.pathname + u.search;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Генерим nonce на каждый запрос (edge runtime поддерживает crypto.randomUUID)
  const nonce = crypto.randomUUID();

  // Хелпер: проставляем CSP и nonce в ответ
  const withCSP = (res: NextResponse) => {
    // прокидываем nonce в рендер (layout его прочитает)
    res.headers.set("x-nonce", nonce);

    // строгая CSP: никаких inline-скриптов, кроме наших с nonce
    const csp = [
      "default-src 'self'",
      // strict-dynamic + nonce: Next/React инлайны будут работать, остальное — только доверенные
      `script-src 'self' 'strict-dynamic' 'nonce-${nonce}' https: http:`,
      "style-src 'self' 'unsafe-inline'",
      "img-src * data: blob:",
      "connect-src *",
      "font-src 'self' data:",
      "frame-src *",
      // опционально:
      // "base-uri 'self'",
      // "form-action 'self'",
      // "object-src 'none'",
      // "upgrade-insecure-requests",
    ].join("; ");

    res.headers.set("Content-Security-Policy", csp);
    return res;
  };

  // Служебные пути — просто пропускаем, но CSP тоже ставим (кроме _next/static/_image по config.matcher)
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/public")
  ) {
    return withCSP(NextResponse.next());
  }

  const token = await readAuthToken(req);

  // Страницы авторизации
  if (pathname.startsWith("/auth")) {
    if (token?.email) {
      const target = safeInternalCallback(req, "/orders");
      return NextResponse.redirect(new URL(target, req.url));
    }
    return withCSP(NextResponse.next());
  }

  // Админка
  if (pathname.startsWith("/admin")) {
    if (!token?.email) {
      const login = new URL("/auth/signin", req.url);
      login.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(login);
    }
    const admin = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
    const email = (token.email ?? "").toLowerCase();
    if (!admin || email !== admin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return withCSP(NextResponse.next());
  }

  // Приватные страницы
  const protectedPrefixes = ["/orders", "/profile", "/account"];
  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (!token?.email) {
      const login = new URL("/auth/signin", req.url);
      login.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(login);
    }
    return withCSP(NextResponse.next());
  }

  // Всё остальное
  return withCSP(NextResponse.next());
}

export const config = {
  matcher: [
    // Исключаем статику/картинки, чтобы не городить CSP на ассетах
    "/((?!api/health|api/webhooks|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
