"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";

/**
 * Старт оплаты со стороны пользователя.
 * Ожидает:
 *  - orderId
 *  - paymentMethod: "yookassa" | "card"
 */
export async function startPayment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const orderId = (formData.get("orderId") as string | null) ?? "";
  const paymentMethod = (formData.get("paymentMethod") as string | null) ?? "";

  if (!orderId || !["yookassa", "card"].includes(paymentMethod)) {
    throw new Error("Invalid input");
  }

  // Проверяем, что заказ принадлежит текущему пользователю
  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    select: { id: true },
  });
  if (!order) throw new Error("Order not found");

  // Никаких записей в историю на этом шаге.
  // Историю пишем только при смене статуса (успех/ошибка/отмена) — в соответствующих хэндлерах.

  // TODO: здесь позже добавим создание платёжной сессии/редирект
  revalidatePath("/orders");
  return { ok: true as const, method: paymentMethod };
}
