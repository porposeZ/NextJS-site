import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

async function readAuthToken(req: NextRequest): Promise<JWT | null> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  let token = await getToken({ req, secret }); // v4
  token ??= await getToken({ req, secret, cookieName: "authjs.session-token" }); // v5
  token ??= await getToken({
    req,
    secret,
    cookieName: "__Secure-authjs.session-token",
  }); // v5 (secure)
  return token;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // 1) Никакой перехват для статических/служебных путей
  if (
    pathname.startsWith("/api/auth") || // next-auth
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const token = await readAuthToken(req);

  // 2) Страницы авторизации
  if (pathname.startsWith("/auth")) {
    // если уже авторизован — уводим с /auth/* на callbackUrl (но не на /auth, чтобы не зациклить)
    if (token?.email) {
      const cb = url.searchParams.get("callbackUrl");
      let target = "/orders";
      if (cb && !cb.startsWith("/auth")) target = cb;
      return NextResponse.redirect(new URL(target, url.origin));
    }
    return NextResponse.next();
  }

  // 3) Админка
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

  // 4) Приватные страницы
  const protectedPrefixes = ["/orders", "/profile", "/account"];
  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (!token?.email) {
      const login = new URL("/auth/signin", url.origin);
      login.searchParams.set("callbackUrl", pathname + url.search);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  // 5) Всё остальное пропускаем
  return NextResponse.next();
}

export const config = {
  // перехватываем всё, кроме перечисленного
  matcher: [
    "/((?!api/health|api/webhooks|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};