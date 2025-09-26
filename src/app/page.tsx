"use client";

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { useForm } from "react-hook-form";

type FormData = {
  fio: string;
  phone: string;
  email: string;
  city: string;
  date: string;
  details: string;
};

export default function HomePage() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const onSubmit = (data: FormData) => {
    console.log("create order", data);
    // TODO: отправить Server Action / tRPC → создать заявку
    reset();
  };

  return (
    <div className="space-y-10">
      <h1 className="text-center text-3xl font-extrabold text-sky-700">Ваши руки в каждом городе</h1>

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
            <Input {...register("city")} placeholder="Москва" />
          </div>
          <div>
            <Label>Дата исполнения</Label>
            <Input type="date" {...register("date")} />
          </div>
          <div className="md:col-span-2">
            <Label>Задача / подробности</Label>
            <Textarea rows={5} {...register("details")} placeholder="Что нужно сделать поручителю?" />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">Создать заказ</Button>
          </div>
        </form>
      </Card>

      {/* секция "Как это работает" — упрощённо */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
        {["Создаёте заказ", "Свяжется менеджер", "Оплатите заказ", "Подбор исполнителя", "Выполнение задачи", "Отчёт"].map((t) => (
          <Card key={t} className="p-4 text-center text-sm">{t}</Card>
        ))}
      </section>
    </div>
  );
}