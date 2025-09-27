import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Единый guard для приватных и auth-страниц.
 * Работает на edge, Prisma не трогает — читаем только JWT из куки.
 */
export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET, // должен совпадать с .env.local
  });

  const { pathname, search } = req.nextUrl;

  // 1) Если уже залогинен и идёт на /auth/* — отправим на /orders
  if (pathname.startsWith("/auth")) {
    if (token) {
      const url = req.nextUrl.clone();
      url.pathname = "/orders";
      url.search = search;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2) Приватные маршруты — пускаем только с токеном
  const isProtected =
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/account");

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    // вернём пользователя обратно после логина
    url.search = new URLSearchParams({ callbackUrl: req.url }).toString();
    return NextResponse.redirect(url);
  }

  // Публичные страницы — пропускаем
  return NextResponse.next();
}

/**
 * Укажи, какие пути обрабатывает middleware.
 * Лендинг "/" оставляем публичным; добавь сюда "/" если хочешь закрыть главную.
 */
export const config = {
  matcher: ["/auth/:path*", "/orders/:path*", "/profile/:path*", "/account/:path*"],
};
