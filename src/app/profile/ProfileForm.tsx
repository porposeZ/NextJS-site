// src/app/profile/ProfileForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { useTransition, useState } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { updateProfile } from "./actions/updateProfile";
import CityCombo from "~/components/CityCombo";

type FormData = {
  name: string;
  phone: string;
  defaultCity: string;
  organization: string;
};

export default function ProfileForm({ initial }: { initial: FormData }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: initial });

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
        <Label className="mb-1 block">
          ФИО <span className="text-rose-500">*</span>
        </Label>
        <Input
          {...register("name", {
            required: "Укажите ФИО",
            minLength: { value: 2, message: "Минимум 2 символа" },
            maxLength: { value: 80, message: "Слишком длинно" },
          })}
          placeholder="Иванов Иван Иванович"
        />
        {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
      </div>

      <div>
        <Label className="mb-1 block">
          Телефон <span className="text-rose-500">*</span>
        </Label>
        <Input
          {...register("phone", {
            required: "Укажите номер",
            validate: (v) => {
              const digits = (v ?? "").replace(/\D/g, "");
              return digits.length >= 10 || "Некорректный номер";
            },
          })}
          placeholder="+7 999 123-45-67"
        />
        {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
      </div>

      <div>
        <Label className="mb-1 block">
          Город по умолчанию <span className="text-rose-500">*</span>
        </Label>
        <CityCombo control={control} name="defaultCity" placeholder="Например, Красноярск" />
      </div>

      <div>
        <Label className="mb-1 block">Организация</Label>
        <Input
          {...register("organization", {
            maxLength: { value: 120, message: "Слишком длинно" },
          })}
          placeholder="ООО «Яесть»"
        />
        {errors.organization && (
          <p className="mt-1 text-xs text-rose-600">{errors.organization.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isPending}>
          {isPending ? "Сохраняем..." : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
