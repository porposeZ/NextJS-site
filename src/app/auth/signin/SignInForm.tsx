"use client";

import { useCallback, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function SignInForm({
  _initialCsrfToken = "",
  callbackUrl = "/orders",
}: {
  _initialCsrfToken?: string;
  callbackUrl?: string;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false); // <- явный флаг отправки
  const lockRef = useRef(false); // <- защита от дабл-кликов/повторной отправки

  // чекбоксы согласий
  const [policy, setPolicy] = useState(false);
  const [orderEmails, setOrderEmails] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (lockRef.current || submitting) return; // уже отправляем
      const value = email.trim().toLowerCase();
      if (!value || !policy) return;

      lockRef.current = true;
      setSubmitting(true);

      try {
        // 1) стэш согласий (не критично, если упадёт)
        await fetch("/api/consents/stash", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: value,
            consent: { policy, orderEmails, marketing },
          }),
        }).catch(() => undefined);

        // 2) вход через Auth.js
        // При redirect: true произойдёт навигация и компонент размонтируется.
        await signIn("email", { email: value, callbackUrl, redirect: true });
      } catch {
        // Если что-то пошло не так и редиректа не случилось — вернём управление
        setSubmitting(false);
        lockRef.current = false;
      }
    },
    [email, policy, orderEmails, marketing, callbackUrl, submitting]
  );

  return (
    <form className="grid gap-4" onSubmit={onSubmit} aria-busy={submitting}>
      <div>
        <Label>Электронная почта</Label>
        <Input
          type="email"
          name="email"
          placeholder="you@mail.ru"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
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
            disabled={submitting}
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
            disabled={submitting}
          />
          <span>Присылать сервисные письма по заказам (создание/смена статуса).</span>
        </label>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            disabled={submitting}
          />
          <span>Редкие новости и предложения (необязательно).</span>
        </label>
      </div>

      <Button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={!policy || !email || submitting}
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Отправляем ссылку…
          </span>
        ) : (
          "Получить ссылку"
        )}
      </Button>

      {/* Подсказка пользователю */}
      {submitting && (
        <p className="text-center text-xs text-slate-500">
          Проверьте почту. Если письма нет — загляните в «Спам».
        </p>
      )}
    </form>
  );
}
