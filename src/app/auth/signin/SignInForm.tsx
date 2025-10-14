"use client";

import { useEffect, useState, useCallback } from "react";
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

  // чекбоксы
  const [policy, setPolicy] = useState(false);          // обязательно
  const [orderEmails, setOrderEmails] = useState(true); // по умолчанию включено
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!csrf) {
      fetch("/api/auth/csrf", { credentials: "include", cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("CSRF fetch failed"))))
        .then((d: { csrfToken?: string }) => setCsrf(d?.csrfToken ?? ""))
        .catch(() => undefined);
    }
  }, [csrf]);

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const v = fd.get("email");
    const email = (typeof v === "string" ? v : "").trim().toLowerCase();

    // 1) стэш согласий в куки (на сервере — без БД)
    try {
      await fetch("/api/consents/stash", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          consent: { policy, orderEmails, marketing },
        }),
      });
    } catch {
      /* ignore */
    }

    // 2) отправляем реальную форму входа
    (form as HTMLFormElement).submit();
  }, [policy, orderEmails, marketing]);

  return (
    <form method="post" action="/api/auth/signin/email" className="grid gap-4" onSubmit={onSubmit}>
      {/* обязательно — токен в hidden + кука уже стоит */}
      <input type="hidden" name="csrfToken" value={csrf} />
      {/* callbackUrl пойдёт внутрь magic-link и сработает ПОСЛЕ входа */}
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div>
        <Label>Электронная почта</Label>
        <Input type="email" name="email" placeholder="you@mail.ru" required />
      </div>

      {/* чекбоксы согласий */}
      <div className="space-y-3 rounded-lg bg-slate-50 p-3 text-sm">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={policy}
            onChange={(e) => setPolicy(e.target.checked)}
            required
          />
          <span>
            Я принимаю{" "}
            <a href="/policy/terms" className="text-sky-700 underline" target="_blank">
              Пользовательское соглашение
            </a>{" "}
            и{" "}
            <a href="/policy/privacy" className="text-sky-700 underline" target="_blank">
              Политику обработки персональных данных
            </a>
            .
          </span>
        </label>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={orderEmails}
            onChange={(e) => setOrderEmails(e.target.checked)}
          />
          <span>Присылать сервисные письма по заказам (создание/смена статуса).</span>
        </label>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
          />
          <span>Редкие новости и предложения (необязательно).</span>
        </label>
      </div>

      <Button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600"
        disabled={!csrf || !policy}
      >
        Получить ссылку
      </Button>
    </form>
  );
}
