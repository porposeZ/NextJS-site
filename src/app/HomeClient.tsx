"use client";

import Steps from "~/components/Steps";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createOrder } from "./actions/createOrder";

type FormData = {
  fio: string;
  phone: string;
  email: string;
  city: string;
  date: string; // YYYY-MM-DD
  details: string;
};

export default function HomeClient(props: {
  user?: { name: string | null; email: string | null; phone: string | null };
}) {
  const { user } = props;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      fio: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      city: "",
      date: "",
      details: "",
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string }>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setToast(undefined);
    try {
      const res = await createOrder({
        city: data.city,
        details: data.details,
        date: data.date || undefined,
      });

      if (!res.ok) {
        if (res.error === "NOT_AUTHENTICATED") {
          router.push("/auth/signin?callbackUrl=/");
          return;
        }
        const msg =
          res.error === "RATE_LIMIT"
            ? "Слишком часто. Попробуйте позже."
            : "Проверьте поля формы";
        setToast({ type: "err", text: msg });
        return;
      }

      reset({ ...data, city: "", date: "", details: "" });
      setToast({ type: "ok", text: "Заявка создана. Смотрите в «Мои заказы»." });
      router.push("/orders");
    } finally {
      setLoading(false);
    }
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
            <Input {...register("phone")} placeholder="+7 999 123-45-67" />
          </div>
          <div>
            <Label>Город</Label>
            <Input
              {...register("city", { required: "Укажите город" })}
              placeholder="Москва"
            />
            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
          </div>
          <div>
            <Label>Дата исполнения</Label>
            <Input type="date" {...register("date")} />
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
              <p className="mt-1 text-xs text-red-600">{errors.details.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? "Отправляем..." : "Создать заказ"}
            </Button>
          </div>
        </form>
      </Card>

      <Steps />
    </div>
  );
}
