import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "~/server/auth"; // из src/server/auth/index.ts

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname, search } = req.nextUrl;

  // защищаем приватные разделы
  const requiresAuth =
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/account");

  // если не залогинен и пытается зайти в приватное — бросаем на /auth/signin
  if (requiresAuth && !session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    // чтобы после логина вернуть обратно
    url.search = new URLSearchParams({ callbackUrl: req.url }).toString();
    return NextResponse.redirect(url);
  }

  // если уже залогинен и идёт на /auth/* — отправим его в /orders
  if (session?.user && pathname.startsWith("/auth")) {
    const url = req.nextUrl.clone();
    url.pathname = "/orders";
    url.search = search;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/orders/:path*", "/profile/:path*", "/account/:path*"],
};