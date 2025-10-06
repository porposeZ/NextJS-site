"use client";

import { useState, useTransition } from "react";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { requestEmailChange } from "./actions/requestEmailChange";

export default function EmailSection({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string }>();
  const [isPending, startTransition] = useTransition();

  const onSend = () => {
    setToast(undefined);
    startTransition(async () => {
      const res = await requestEmailChange(email);
      if (!res.ok) {
        const map: Record<string, string> = {
          NOT_AUTH: "Авторизация истекла. Перезайдите.",
          INVALID_EMAIL: "Введите корректный E-mail.",
          EMAIL_TAKEN: "Такой E-mail уже используется.",
          DB_ERROR: "Не удалось создать заявку.",
        };
        setToast({ type: "err", text: map[res.error] ?? "Ошибка" });
        return;
      }
      setToast({
        type: "ok",
        text:
          "Ссылка для подтверждения отправлена. Проверьте почту (в тестовом режиме ссылка появится в логах сервера).",
      });
      setTimeout(() => setToast(undefined), 7000);
    });
  };

  return (
    <Card className="p-6">
      <h2 className="mb-2 text-lg font-semibold">Смена e-mail</h2>
      <p className="mb-4 text-sm text-slate-600">
        Текущий e-mail используется для входа и уведомлений. Чтобы изменить его, укажите новый адрес
        и подтвердите по ссылке из письма.
      </p>

      {toast && (
        <div
          className={`mb-3 rounded-md border px-3 py-2 text-sm ${
            toast.type === "ok"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="grid gap-2 sm:max-w-md">
        <Label>Новый e-mail</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
        />
        <div className="mt-3">
          <Button onClick={onSend} disabled={isPending}>
            {isPending ? "Отправляем..." : "Отправить подтверждение"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
