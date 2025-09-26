import "~/styles/globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
import Providers from "./_providers";
import UserMenu from "./_components/UserMenu";

export const metadata = {
  title: "Я есть",
  description: "Сервис поручений",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-sky-50/40 text-slate-900">
        <Providers>
          <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="font-extrabold text-sky-600">
                Я есть
              </Link>

              <div className="flex items-center gap-6 text-sm">
                <Link href="/orders" className="hover:text-sky-600">
                  Мои заказы
                </Link>
                <Link href="/about" className="hover:text-sky-600">
                  О нас
                </Link>
                <Link href="/profile" className="hover:text-sky-600">
                  Личный кабинет
                </Link>

                <UserMenu />
              </div>
            </nav>
          </header>

          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
