"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";

export default function SignOutButton({
  className,
  size = "sm",
  variant = "secondary",
  children = "Выйти",
}: {
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "secondary" | "destructive" | "ghost" | "link" | "outline";
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  const doSignOut = async () => {
    try {
      setLoading(true);

      // 1) Берём CSRF токен с /api/auth/csrf
      const res = await fetch("/api/auth/csrf", { cache: "no-store" });
      const data = await res.json();
      const csrfToken =
        data?.csrfToken || data?.csrf || data?.token || data?.value || "";

      // 2) Отправляем POST на signout c токеном (двойной ключ для совместимости)
      const body = new URLSearchParams();
      if (csrfToken) {
        body.set("csrfToken", csrfToken);
        body.set("csrf", csrfToken);
      }

      const out = await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      // 3) Перенаправление/обновление после выхода
      if (out.redirected) {
        window.location.href = out.url;
      } else {
        // fallback — просто на главную
        window.location.href = "/";
      }
    } catch (e) {
      // крайний fallback, если что-то не так
      window.location.href = "/api/auth/signout";
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={doSignOut}
      disabled={loading}
    >
      {loading ? "Выходим..." : children}
    </Button>
  );
}
