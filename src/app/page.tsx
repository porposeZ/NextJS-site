"use client";

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import Steps from "~/components/Steps";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createOrder, type CreateOrderResult } from "./actions/createOrder";

type PersonType = "fl" | "ul";

type FormData = {
  fio?: string;
  phone?: string;
  email?: string;
  city: string;
  date: string; // YYYY-MM-DD
  details: string;
  org?: string; // для юр.лиц
};

const CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Красноярск",
  "Ростов-на-Дону",
  "Самара",
  "Тюмень",
  "Уфа",
] as const;

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [personType, setPersonType] = useState<PersonType>("fl"); // fl — физ., ul — юр.

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { city: CITIES[0] as string },
  });

  const isUL = personType === "ul";

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Склеиваем «Организацию» в описание (бэкенд не меняем)
      const description =
        isUL && data.org?.trim()
          ? `Организация: ${data.org.trim()}\n\n${data.details.trim()}`
          : data.details.trim();

      const res: CreateOrderResult = await createOrder({
        city: data.city,
        details: description,
        date: data.date || undefined,
      });

      if (!res.ok) {
        if (res.error === "NOT_AUTHENTICATED") {
          router.push("/auth/signin?callbackUrl=/");
          return;
        }
        alert("Проверьте поля формы");
        return;
      }

      reset();
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

      {/* ФОРМА */}
      <Card className="mx-auto max-w-6xl p-6">
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Тип лица */}
          <div className="md:col-span-2 flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ptype"
                checked={personType === "fl"}
                onChange={() => setPersonType("fl")}
              />
              Для физических лиц
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ptype"
                checked={personType === "ul"}
                onChange={() => setPersonType("ul")}
              />
              Для юридических лиц
            </label>
          </div>

          {/* ФИО / Email */}
          <div>
            <Label>ФИО</Label>
            <Input {...register("fio")} placeholder="Иванов Иван" />
          </div>
          <div>
            <Label>Электронная почта</Label>
            <Input
              type="email"
              {...register("email")}
              placeholder="you@mail.ru"
            />
          </div>

          {/* Телефон / Город */}
          <div>
            <Label>Номер телефона</Label>
            <Input
              {...register("phone")}
              placeholder="+7 999 123-45-67"
              inputMode="tel"
            />
          </div>
          <div>
            <Label>
              Город<span className="text-red-500">*</span>
            </Label>
            <Input
              list="cities"
              {...register("city", { required: true })}
              placeholder="Москва"
            />
            <datalist id="cities">
              {CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Дата */}
          <div>
            <Label>
              Дата исполнения<span className="text-red-500">*</span>
            </Label>
            <Input type="date" {...register("date", { required: true })} />
          </div>

          {/* Организация — показываем и требуем только для ЮЛ */}
          {isUL ? (
            <div>
              <Label>
                Организация<span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("org", {
                  required: true,
                  minLength: 2,
                })}
                placeholder="ООО «Ромашка»"
              />
              {errors.org && (
                <p className="mt-1 text-xs text-red-600">
                  Укажите наименование организации
                </p>
              )}
            </div>
          ) : (
            <div /> // чтобы сетка оставалась ровной в 2 колонки
          )}

          {/* Описание */}
          <div className="md:col-span-2">
            <Label>
              Задача / подробности<span className="text-red-500">*</span>
            </Label>
            <Textarea
              rows={5}
              {...register("details", { required: true, minLength: 10 })}
              placeholder="Что нужно сделать поручителю?"
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? "Отправляем..." : "Создать заказ"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Цифры под формой */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-2 text-center text-sky-700 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-2xl font-extrabold">9000+</div>
          <div className="text-xs text-slate-600">исполнителей готовы помочь</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-extrabold">18 523</div>
          <div className="text-xs text-slate-600">выполненных заказа</div>
        </Card>
      </div>

      {/* Почему удобно */}
      <section className="mx-auto max-w-6xl px-2">
        <h2 className="mb-4 text-center text-2xl font-extrabold text-sky-700">
          Почему с нами удобно
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl p-5">
            <h3 className="font-semibold">Поддержка 24/7</h3>
            <p className="mt-2 text-sm text-slate-600">
              Мы всегда на связи: отвечаем быстро, помогаем найти решение и
              даём статус по заказу.
            </p>
          </Card>
          <Card className="rounded-2xl p-5">
            <h3 className="font-semibold">Проверенные исполнители</h3>
            <p className="mt-2 text-sm text-slate-600">
              Анкета, репутация, реальные задания. Оставляем только надёжных.
            </p>
          </Card>
          <Card className="rounded-2xl p-5">
            <h3 className="font-semibold">Гарантия и скорость</h3>
            <p className="mt-2 text-sm text-slate-600">
              Назначаем менеджера, контролируем сроки и качество. Если что-то
              не так — заменим исполнителя.
            </p>
          </Card>
          <Card className="rounded-2xl p-5">
            <h3 className="font-semibold">Справедливые цены</h3>
            <p className="mt-2 text-sm text-slate-600">
              Фиксируем стоимость заранее и показываем, из чего она состоит. Без
              скрытых платежей.
            </p>
          </Card>
        </div>
      </section>

      {/* Как это работает — оставляем ОДИН заголовок (идёт из компонента Steps) */}
      <Steps />
    </div>
  );
}
