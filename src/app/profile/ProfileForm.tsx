"use client";

import { useForm } from "react-hook-form";
import { useTransition, useState } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { updateProfile } from "./actions/updateProfile";

type FormData = {
  name: string;
  phone: string;
  defaultCity: string;
};

export default function ProfileForm({ initial }: { initial: FormData }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: initial,
  });

  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string }>();

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
      setTimeout(() => setToast(undefined), 3500);
    });
  };

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

      <div>
        <Label>ФИО</Label>
        <Input
          {...register("name", {
            required: "Укажите ФИО",
            minLength: { value: 2, message: "Минимум 2 символа" },
            maxLength: { value: 80, message: "Слишком длинно" },
          })}
          placeholder="Иванов Иван Иванович"
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
      </div>

      <div>
        <Label>Город по умолчанию</Label>
        <Input {...register("defaultCity")} placeholder="Например, Москва" />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isPending}>
          {isPending ? "Сохраняем..." : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
