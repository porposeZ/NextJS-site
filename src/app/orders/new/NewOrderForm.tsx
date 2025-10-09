"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema, type OrderForm } from "./schema";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card } from "~/components/ui/card";

type FieldErrors = Partial<Record<keyof OrderForm, string[]>>;
type ActionResult = { ok: boolean; errors?: FieldErrors };

type Props = {
  // Server Action сверху может вернуть объект ошибок ИЛИ редиректить (void)
  action: (formData: FormData) => Promise<ActionResult | void>;
};

export default function NewOrderForm({ action }: Props) {
  const {
    register,
    formState: { errors, isSubmitting },
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
  });

  // Обёртка с требуемой сигнатурой (Promise<void>)
  const onAction = async (formData: FormData) => {
    await action(formData);
  };

  return (
    <Card className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Новый заказ</h1>

      {/* Только серверный action. onSubmit не нужен — убираем no-empty-function */}
      <form action={onAction} className="space-y-4">
        <div>
          <Label htmlFor="city">Город</Label>
          <Input id="city" {...register("city")} />
          {errors.city && (
            <p className="text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea id="description" rows={5} {...register("description")} />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="budget">Бюджет (необязательно)</Label>
          <Input id="budget" type="number" {...register("budget")} />
          {errors.budget && (
            <p className="text-sm text-red-600">{errors.budget.message}</p>
          )}
        </div>

        <Button disabled={isSubmitting} className="bg-black text-white">
          {isSubmitting ? "Создаю..." : "Создать"}
        </Button>
      </form>
    </Card>
  );
}
