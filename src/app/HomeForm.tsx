// src/app/HomeForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { createOrder, type CreateOrderResult } from "./actions/createOrder";

type FormData = {
  fio: string;
  phone?: string;
  email?: string;
  city: string;
  date: string;   // YYYY-MM-DD
  details: string;
};

export default function HomeForm({
  defaultEmail,
  defaultPhone,
}: {
  defaultEmail?: string;
  defaultPhone?: string;
}) {
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      email: defaultEmail ?? "",
      phone: defaultPhone ?? "",
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (!data.city || !data.details || !data.date) {
        alert("Пожалуйста, заполните город, дату исполнения и задачу.");
        return;
      }

      const res: CreateOrderResult = await createOrder({
        city: data.city,
        details: data.details,
        date: data.date,
      });

      if (!res.ok) {
        if (res.error === "NOT_AUTHENTICATED") {
          router.push("/auth/signin?callbackUrl=/");
          return;
        }
        alert("Проверьте поля формы");
        return;
      }

      reset({
        fio: "",
        email: defaultEmail ?? "",
        phone: defaultPhone ?? "",
        city: "",
        date: "",
        details: "",
      });
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
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
          <Label className="mb-1 block">ФИО</Label>
          <Input {...register("fio")} placeholder="Иванов Иван" />
        </div>
        <div>
          <Label className="mb-1 block">Электронная почта</Label>
          <Input type="email" {...register("email")} placeholder="you@mail.ru" />
        </div>
        <div>
          <Label className="mb-1 block">Номер телефона</Label>
          <Input {...register("phone")} placeholder="+7 999 123-45-67" />
        </div>
        <div>
          <Label className="mb-1 block">
            Город<span className="text-rose-500">*</span>
          </Label>
          <Input {...register("city", { required: true })} placeholder="Москва" />
        </div>
        <div>
          <Label className="mb-1 block">
            Дата исполнения<span className="text-rose-500">*</span>
          </Label>
          <Input type="date" {...register("date", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <Label className="mb-1 block">
            Задача / подробности<span className="text-rose-500">*</span>
          </Label>
          <Textarea
            rows={5}
            {...register("details", { required: true })}
            placeholder="Что нужно сделать поручителю?"
          />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
            {loading ? "Отправляем..." : "Создать заказ"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
