"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function SignInForm({
  initialCsrfToken = "",
  callbackUrl = "/orders",
}: {
  initialCsrfToken?: string;
  callbackUrl?: string;
}) {
  const [csrf, setCsrf] = useState(initialCsrfToken);

  // Берём CSRF именно в браузере, чтобы кука поставилась в браузер
  useEffect(() => {
    if (!csrf) {
      fetch("/api/auth/csrf", { credentials: "include", cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("csrf fetch failed"))))
        .then((d: { csrfToken?: string }) => setCsrf(d?.csrfToken ?? ""))
        .catch(() => undefined);
    }
  }, [csrf]);

  return (
    <form method="post" action="/api/auth/signin/email" className="grid gap-4">
      {/* обязательно — токен в hidden + кука уже стоит */}
      <input type="hidden" name="csrfToken" value={csrf} />
      {/* callbackUrl пойдёт внутрь magic-link и сработает ПОСЛЕ входа */}
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div>
        <Label>Электронная почта</Label>
        <Input type="email" name="email" placeholder="you@mail.ru" required />
      </div>

      <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={!csrf}>
        Получить ссылку
      </Button>
    </form>
  );
}
