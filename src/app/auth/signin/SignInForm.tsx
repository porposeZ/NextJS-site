"use client";

import { useCallback, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function SignInForm({
  // CSRF больше не используем — подчёркиваем это префиксом "_"
  _initialCsrfToken = "",
  callbackUrl = "/orders",
}: {
  _initialCsrfToken?: string;
  callbackUrl?: string;
}) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();

  // чекбоксы согласий
  const [policy, setPolicy] = useState(false);
  const [orderEmails, setOrderEmails] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const value = email.trim().toLowerCase();
      if (!value || !policy) return;

      // 1) стэш согласий
      try {
        await fetch("/api/consents/stash", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: value,
            consent: { policy, orderEmails, marketing },
          }),
        });
      } catch {
        /* ignore */
      }

      // 2) стандартный вход через Auth.js
      startTransition(() => {
        void signIn("email", { email: value, callbackUrl, redirect: true });
      });
    },
    [email, policy, orderEmails, marketing, callbackUrl]
  );

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div>
        <Label>Электронная почта</Label>
        <Input
          type="email"
          name="email"
          placeholder="you@mail.ru"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

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
        disabled={!policy || !email || pending}
      >
        {pending ? "Отправляем ссылку..." : "Получить ссылку"}
      </Button>
    </form>
  );
}
