"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";
import { OrderEventType } from "@prisma/client";

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

  // Логируем выбор способа оплаты
  await db.orderEvent.create({
    data: {
      orderId,
      userId: session.user.id,
      type: OrderEventType.PAYMENT_METHOD_SELECTED, // <-- правильное значение из твоего enum
      message:
        paymentMethod === "yookassa"
          ? "Пользователь выбрал оплату через ЮKassa"
          : "Пользователь выбрал оплату банковской картой",
    },
  });

  // TODO: здесь позже добавим создание платёжной сессии/редирект
  revalidatePath("/orders");
  return { ok: true as const, method: paymentMethod };
}
