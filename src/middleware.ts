import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { env } from "./server/env";

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

/** домены T-Bank, которые нужно разрешить в CSP при включённых платежах */
const T_DOMAINS = [
  "*.tinkoff.ru",
  "*.tcsbank.ru",
  "*.tbank.ru",
  "*.nspk.ru",
  "*.t-static.ru",
];

/** собираем CSP c учётом платежей */
function buildCsp(nonce: string) {
  // базовый набор
  const directives: Record<string, string> = {
    "default-src": `'self'`,
    "script-src": `'self' 'strict-dynamic' 'nonce-${nonce}' https: http:`,
    "style-src": `'self' 'unsafe-inline'`,
    "img-src": `* data: blob:`,
    "connect-src": `*`,
    "font-src": `'self' data:`,
    // ВАЖНО: когда платежи выключены — можно оставить frame-src,
    // но при iframe-оплате эту директиву иметь НЕЛЬЗЯ (ломает 3DS).
    "frame-src": `*`,
    // при желании можно вернуть base-uri/form-action/object-src и т.д.
  };

  // если включены платежи — расширяем и убираем frame-src
  if (env.TINKOFF_TERMINAL_KEY) {
    const add = ` https://${T_DOMAINS.join(" https://")}`;
    directives["script-src"] += add;
    directives["img-src"] += add;
    directives["connect-src"] += add;
    directives["style-src"] += add;

    // критично: директиву frame-src удаляем целиком
    delete directives["frame-src"];
  }

  // собираем строку
  return Object.entries(directives)
    .map(([k, v]) => `${k} ${v}`)
    .join("; ");
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Генерим nonce на каждый запрос (в edge runtime crypto доступен глобально)
  const nonce = crypto.randomUUID();

  // Хелпер: проставляем CSP и nonce в ответ
  const withCSP = (res: NextResponse) => {
    res.headers.set("x-nonce", nonce);
    res.headers.set("Content-Security-Policy", buildCsp(nonce));
    return res;
  };

  // Служебные пути — пропускаем, но CSP тоже ставим (кроме исключений из matcher)
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
