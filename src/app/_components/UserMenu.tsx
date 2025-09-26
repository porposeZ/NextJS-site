// src/app/_components/UserMenu.tsx
"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data } = useSession();
  const user = data?.user;

  if (!user) {
    // просто ссылка на страницу входа
    return (
      <Link
        href="/auth/signin"
        className="rounded bg-sky-600 px-3 py-1.5 text-white hover:bg-sky-700"
      >
        Войти
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600">{user.email ?? "Профиль"}</span>
      <button
        className="rounded bg-slate-200 px-3 py-1.5 hover:bg-slate-300"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Выйти
      </button>
    </div>
  );
}
