import { z } from "zod";

export const orderSchema = z.object({
  city: z.string().min(2, "Минимум 2 символа"),
  description: z.string().min(5, "Минимум 5 символов"),
  // Разрешаем "" из инпута; на выходе получаем number | undefined
  budget: z
    .union([z.coerce.number().int().positive(), z.literal("").transform(() => undefined)])
    .optional(),
});

// 👉 выход (что получим ПОСЛЕ safeParse) — используем на сервере
export type OrderInput = z.infer<typeof orderSchema>;

// 👉 вход (что реально приходит в форму ДО парсинга) — используем в useForm
export type OrderForm = z.input<typeof orderSchema>;
