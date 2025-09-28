"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const Input = z.object({
  city: z.string().min(1, "Город обязателен"),
  details: z.string().min(1, "Описание обязательно"),
  date: z.string().optional(), // YYYY-MM-DD
});

export type CreateOrderResult =
  | { ok: true; id: string }
  | { ok: false; error: "NOT_AUTHENTICATED" | "VALIDATION_ERROR" | "DB_ERROR" };

export async function createOrder(raw: unknown): Promise<CreateOrderResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    console.warn("[orders] createOrder: no session");
    return { ok: false, error: "NOT_AUTHENTICATED" };
  }

  const parsed = Input.safeParse(raw);
  if (!parsed.success) {
    console.warn("[orders] createOrder: validation failed", parsed.error.flatten());
    return { ok: false, error: "VALIDATION_ERROR" };
  }

  const { city, details, date } = parsed.data;

  // YYYY-MM-DD -> Date
  const dueDate =
    date && date.trim().length > 0 ? new Date(`${date}T00:00:00.000Z`) : undefined;

  try {
    // Формируем объект данных без конфликтов типов редактора
    const data: any = {
      userId,
      city,
      description: details,
      status: "REVIEW",
    };
    if (dueDate) data.dueDate = dueDate;

    const order = await db.order.create({
      data,
      select: { id: true },
    });

    console.log("[orders] created", { orderId: order.id, userId });

    revalidatePath("/orders");
    return { ok: true, id: order.id };
  } catch (err) {
    console.error("[orders] create failed:", err);
    return { ok: false, error: "DB_ERROR" };
  }
}
