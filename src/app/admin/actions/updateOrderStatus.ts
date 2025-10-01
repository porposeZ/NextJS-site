"use server";

import React from "react";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { requireAdmin } from "~/server/auth/roles";
import { sendMail } from "~/server/email/send";
import OrderStatusChangedEmail, { readableStatus } from "~/emails/OrderStatusChangedEmail";
import { env } from "~/server/env";

const STATUSES = ["REVIEW","AWAITING_PAYMENT","IN_PROGRESS","DONE","CANCELED"] as const;
type OrderStatus = typeof STATUSES[number];

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;

  if (!id || !STATUSES.includes(status)) throw new Error("Invalid input");

  const updated = await db.order.update({ where: { id }, data: { status } });

  // история: смена статуса
  await db.orderEvent.create({
    data: {
      orderId: id,
      type: "STATUS_CHANGED",
      message: `Статус изменён на ${status}`,
    },
  });

  // письмо пользователю
  try {
    const order = await db.order.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });
    if (order?.user?.email) {
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
