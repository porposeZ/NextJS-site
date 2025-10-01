"use client";

import Steps from "~/components/Steps";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createOrder } from "./actions/createOrder";
import { isValidCity } from "~/lib/cities";
import CityCombobox from "~/components/CityCombobox";

type FormData = {
  fio: string;
  email: string;
  city: string;
  date: string; // YYYY-MM-DD
  details: string;
};

function formatRuPhone(input: string) {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (d.length === 10 && d.startsWith("9")) d = "7" + d;
  const valid = d.length === 11 && d[0] === "7";
  let rest = d[0] === "7" ? d.slice(1) : d;
  const p1 = rest.slice(0, 3);
  const p2 = rest.slice(3, 6);
  const p3 = rest.slice(6, 8);
  const p4 = rest.slice(8, 10);
  const formatted =
    (p1 || p2 || p3 || p4)
      ? `+7${p1 ? " " + p1 : ""}${p2 ? " " + p2 : ""}${p3 ? "-" + p3 : ""}${p4 ? "-" + p4 : ""}`
      : (input.trim().startsWith("+") ? input : "");
  return { formatted, valid, digits: d };
}

export default function HomeClient(props: {
  user?: { name: string | null; email: string | null; phone: string | null; defaultCity?: string | null };
}) {
  const { user } = props;
  const router = useRouter();

  const [phone, setPhone] = useState<string>(user?.phone ?? "");
  const phoneState = useMemo(() => formatRuPhone(phone), [phone]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      fio: user?.name ?? "",
      email: user?.email ?? "",
      city: user?.defaultCity ?? "",
      date: "",
      details: "",
    },
    mode: "onBlur",
  });

  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string }>();

  const onSubmit = async (data: FormData) => {
    setToast(undefined);

    if (phone.trim().length > 0 && !phoneState.valid) {
      setToast({ type: "err", text: "Проверьте номер телефона." });
      return;
    }

    const res = await createOrder({
      city: data.city,
      details: data.details,
      date: data.date, // теперь обязательно
    });

    if (!res.ok) {
      const map: Record<string, string> = {
        NOT_AUTHENTICATED: "Нужно войти в аккаунт.",
        VALIDATION_ERROR: "Проверьте поля формы.",
        RATE_LIMIT: "Слишком часто. Попробуйте позже.",
        DB_ERROR: "Не удалось создать заказ.",
      };
      setToast({ type: "err", text: map[res.error] ?? "Ошибка" });
      if (res.error === "NOT_AUTHENTICATED") router.push("/auth/signin?callbackUrl=/");
      return;
    }

    reset({ ...data, date: "", details: "" });
    setToast({ type: "ok", text: "Заявка создана. Смотрите в «Мои заказы»." });
    router.push("/orders");
  };

  return (
    <div className="space-y-10">
      <h1 className="text-center text-3xl font-extrabold text-sky-700">
        Ваши руки в каждом городе
      </h1>

      {toast && (
        <div
          className={`mx-auto max-w-4xl rounded-md border px-4 py-3 text-sm ${
            toast.type === "ok"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.text}
        </div>
      )}

      <Card className="mx-auto max-w-4xl p-6">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="md:col-span-2 flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="type" defaultChecked /> Для физических лиц
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="type" /> Для юридических лиц
            </label>
          </div>

          <div>
            <Label>ФИО</Label>
            <Input {...register("fio")} placeholder="Иванов Иван" />
          </div>

          <div>
            <Label>Электронная почта</Label>
            <Input type="email" {...register("email")} placeholder="you@mail.ru" />
          </div>

          <div>
            <Label>Номер телефона</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(formatRuPhone(e.target.value).formatted || e.target.value)}
              placeholder="+7 999 123-45-67"
            />
            <div className="mt-1 text-xs">
              {phone && !phoneState.valid ? (
                <span className="text-red-600">Некорректный номер.</span>
              ) : (
                <span className="text-slate-500">Подставляется из личного кабинета (если указан).</span>
              )}
            </div>
          </div>

          <div>
            <Label>Город</Label>
            <Controller
              control={control}
              name="city"
              rules={{
                required: "Укажите город",
                validate: (v) => isValidCity(v) || "Выберите город из списка",
              }}
              render={({ field, fieldState }) => (
                <CityCombobox
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message ?? null}
                />
              )}
            />
          </div>

          <div>
            <Label>Дата исполнения</Label>
            <Input type="date" {...register("date", { required: "Выберите дату исполнения" })} />
            {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message as string}</p>}
          </div>

          <div className="md:col-span-2">
            <Label>Задача / подробности</Label>
            <Textarea
              rows={5}
              {...register("details", {
                required: "Опишите, что нужно сделать",
                minLength: { value: 10, message: "Минимум 10 символов" },
              })}
              placeholder="Что нужно сделать поручителю?"
            />
            {errors.details && (
              <p className="mt-1 text-xs text-red-600">{errors.details.message as string}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Отправляем..." : "Создать заказ"}
            </Button>
          </div>
        </form>
      </Card>

      <Steps />
    </div>
  );
}
