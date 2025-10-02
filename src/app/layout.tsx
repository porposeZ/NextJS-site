import type { Metadata } from "next";
import "../styles/globals.css";

import Footer from "~/components/Footer";
import FloatingContacts from "~/components/FloatingContacts";
import { auth } from "~/server/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Я есть — поручения в любом городе",
  description:
    "Сервис поручений: создайте заказ в любом городе РФ — мы подберём проверенного исполнителя и доведём до результата.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const email = session?.user?.email;

  return (
    <html lang="ru" className="h-full">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        {/* HEADER */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
            <Link href="/" className="font-extrabold text-sky-700">
              Я есть
            </Link>

            <nav className="flex items-center gap-4 text-sm">
              <Link href="/orders" className="hover:text-sky-700">
                Мои заказы
              </Link>
              <Link href="/about" className="hover:text-sky-700">
                О нас
              </Link>
              <Link href="/profile" className="hover:text-sky-700">
                Личный кабинет
              </Link>

              {email ? (
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-slate-600 sm:inline">
                    {email}
                  </span>
                  <form method="post" action="/api/auth/signout">
                    <button
                      className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
                      type="submit"
                    >
                      Выйти
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="rounded-md bg-orange-500 px-3 py-1 text-sm font-medium text-white hover:bg-orange-600"
                >
                  Войти
                </Link>
              )}
            </nav>
          </div>
        </header>

        {/* CONTENT */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

        {/* FOOTER + Floating contacts */}
        <Footer />
        <FloatingContacts />
      </body>
    </html>
  );
}
