"use client";

import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { updateProfile } from "./actions/updateProfile";
import { clearSessions } from "./actions/clearSessions";

type FormData = {
  name: string;
  phone: string;
  image: string;
  defaultCity: string;
  notifyOnStatusChange: boolean;
  notifyOnPayment: boolean;
};

export default function ProfileForm({ initial }: { initial: FormData }) {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
    defaultValues: initial,
  });

  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string }>();
  const [sessionsToast, setSessionsToast] = useState<string | undefined>();

  const onSubmit = (data: FormData) => {
    setToast(undefined);
    startTransition(async () => {
      const res = await updateProfile(data);
      if (!res.ok) {
        const map: Record<string, string> = {
          NOT_AUTHENTICATED: "Авторизация истекла. Перезайдите.",
          VALIDATION_ERROR: "Проверьте корректность полей.",
          PHONE_TAKEN: "Такой номер уже используется.",
          DB_ERROR: "Не удалось сохранить данные.",
        };
        setToast({ type: "err", text: map[res.error] ?? "Ошибка" });
        return;
      }
      setToast({ type: "ok", text: "Профиль обновлён." });
      reset(data);
      setTimeout(() => setToast(undefined), 3500);
    });
  };

  const onClearSessions = () => {
    setSessionsToast(undefined);
    startTransition(async () => {
      await clearSessions();
      setSessionsToast("Все сессии (кроме текущей) завершены.");
      setTimeout(() => setSessionsToast(undefined), 4000);
    });
  };

  const imagePreview = watch("image");

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      {toast && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            toast.type === "ok"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="grid grid-cols-[80px_1fr] items-center gap-4">
        <img
          src={imagePreview || `https://www.gravatar.com/avatar/?d=identicon`}
          alt="Preview"
          className="h-16 w-16 rounded-full bg-slate-200 object-cover"
        />
        <div>
          <Label>Аватар (URL)</Label>
          <Input {...register("image")} placeholder="https://..." />
          <p className="mt-1 text-xs text-slate-500">Можно оставить пустым — будет сгенерирован аватар.</p>
        </div>
      </div>

      <div>
        <Label>ФИО</Label>
        <Input
          {...register("name", {
            required: "Укажите ФИО",
            minLength: { value: 2, message: "Минимум 2 символа" },
            maxLength: { value: 80, message: "Слишком длинно" },
          })}
          placeholder="Иванов Иван"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <Label>Телефон</Label>
        <Input
          {...register("phone", {
            validate: (v) => {
              const digits = (v ?? "").replace(/\D/g, "");
              return digits.length === 0 || digits.length >= 10 || "Некорректный номер";
            },
          })}
          placeholder="+7 999 123-45-67"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        <p className="mt-1 text-xs text-slate-500">Можно оставить пустым.</p>
      </div>

      <div>
        <Label>Город по умолчанию</Label>
        <Input {...register("defaultCity")} placeholder="Например, Москва" />
        <p className="mt-1 text-xs text-slate-500">Подставляется в форму заказа.</p>
      </div>

      <div className="mt-2 grid gap-2 rounded-md border p-3">
        <div className="font-medium">Уведомления на почту</div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("notifyOnStatusChange")} />
          Об изменении статуса заявки
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("notifyOnPayment")} />
          Об оплате и счётах
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600"
          disabled={isPending}
        >
          {isPending ? "Сохраняем..." : "Сохранить"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() => reset(initial)}
          disabled={isPending}
        >
          Сбросить
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onClearSessions}
          disabled={isPending}
        >
          Выйти со всех устройств
        </Button>
      </div>

      {sessionsToast && (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
          {sessionsToast}
        </div>
      )}
    </form>
  );
}
