"use server";

import type { OrderStatus } from "@prisma/client";
import { getSession } from "~/server/auth/getSession";
import { db } from "~/server/db";
import { env } from "~/server/env";
import { sendMail } from "~/server/email/send";
import OrderStatusChanged from "~/emails/OrderStatusChanged";

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
) {
  const session = await getSession();
  if (!session?.user?.email || session.user.email !== env.ADMIN_EMAIL) {
    return { ok: false as const, error: "FORBIDDEN" as const };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!order) return { ok: false as const, error: "NOT_FOUND" as const };

  const oldStatus = order.status;
  const updated = await db.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: { user: true },
  });

  try {
    if (updated.user?.email) {
      await sendMail({
        to: updated.user.email,
        subject: "Статус вашего заказа обновлён",
        react: OrderStatusChanged({
          userName: updated.user.name ?? null,
          orderId: updated.id,
          oldStatus: String(oldStatus),
          newStatus: String(newStatus),
        }),
      });
    }
  } catch {
    // глушим, письма — best-effort
  }

  return { ok: true as const };
}
