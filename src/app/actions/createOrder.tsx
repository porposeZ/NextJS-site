"use server";

import { z } from "zod";
import { auth } from "~/server/auth"; // ✅
import { db } from "~/server/db";

const CreateOrderSchema = z.object({
  city: z.string().min(2, "Укажите город"),
  details: z.string().min(5, "Опишите задачу"),
  date: z.string().optional(), // поле в БД пока не используем
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export async function createOrder(raw: CreateOrderInput) {
  const session = await auth();                     // ✅
  if (!session?.user?.id) {
    return { ok: false, error: "NOT_AUTHENTICATED" as const };
  }

  const parsed = CreateOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const { city, details } = parsed.data;

  await db.order.create({
    data: {
      userId: session.user.id,
      city,
      description: details,
      // dueDate: ...  добавим, когда поле появится в Prisma
    },
  });

  return { ok: true as const };
}
