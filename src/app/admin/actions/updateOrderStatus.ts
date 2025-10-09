"use server";

import React from "react";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { requireAdmin } from "~/server/auth/roles";
import { sendMail } from "~/server/email/send";
import OrderStatusChangedEmail, {
  readableStatus,
} from "~/emails/OrderStatusChangedEmail";
import { env } from "~/server/env";
import { OrderStatus } from "@prisma/client";

/** Разрешённые статусы из Prisma enum */
const STATUSES: readonly OrderStatus[] = [
  OrderStatus.REVIEW,
  OrderStatus.AWAITING_PAYMENT,
  OrderStatus.IN_PROGRESS,
  OrderStatus.DONE,
  OrderStatus.CANCELED,
] as const;

/** Type guard для надёжной проверки строки */
function isOrderStatus(s: string): s is OrderStatus {
  return (STATUSES as readonly string[]).includes(s);
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = (formData.get("id") as string | null) ?? "";
  const rawStatus = (formData.get("status") as string | null) ?? "";

  if (!id || !isOrderStatus(rawStatus)) {
    throw new Error("Invalid input");
  }
  const status: OrderStatus = rawStatus;

  await db.order.update({ where: { id }, data: { status } });

  // История: смена статуса
  await db.orderEvent.create({
    data: {
      orderId: id,
      type: "STATUS_CHANGED",
      message: `Статус изменён на ${status}`,
    },
  });

  // Письмо пользователю — по настройке notifyOnStatusChange
  try {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true, name: true, notifyOnStatusChange: true },
        },
      },
    });

    if (order?.user?.email && (order.user.notifyOnStatusChange ?? true)) {
      const appUrl = env.AUTH_URL ?? env.NEXTAUTH_URL;
      await sendMail({
        to: order.user.email,
        subject: `Статус вашей заявки: ${readableStatus(status)}`,
        react: React.createElement(OrderStatusChangedEmail, {
          status,
          order: {
            id: order.id,
            city: order.city,
            description: order.description,
            createdAt: order.createdAt,
            dueDate: order.dueDate ?? undefined,
          },
          appUrl,
          userName: order.user.name ?? undefined,
        }),
      });
    }
  } catch (e) {
    console.warn("[email] status-changed failed:", e);
  }

  revalidatePath("/admin/orders");
}
