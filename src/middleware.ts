import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Guard для приватных и auth-страниц.
 * Работает на edge: читаем только JWT из куки.
 */
export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname, search } = req.nextUrl;

  // Уже залогинен и идёт на /auth/* — отправим на /orders
  if (pathname.startsWith("/auth")) {
    if (token) {
      const url = req.nextUrl.clone();
      url.pathname = "/orders";
      url.search = search;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Приватные маршруты — пускаем только с токеном
  const isProtected =
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/account");

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";

    // ВАЖНО: callbackUrl делаем относительным, без хоста
    const returnTo = `${pathname}${search}`;
    url.search = new URLSearchParams({ callbackUrl: returnTo }).toString();

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/orders/:path*", "/profile/:path*", "/account/:path*"],
};
