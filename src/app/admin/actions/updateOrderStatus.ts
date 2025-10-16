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

/** Разрешённые статусы из актуального Prisma enum */
const STATUSES: readonly OrderStatus[] = [
  OrderStatus.REVIEW,
  OrderStatus.AWAITING_PAYMENT,
  OrderStatus.IN_PROGRESS,
  OrderStatus.DONE,
  OrderStatus.CANCELED,
] as const;

/** Type guard для надёжной проверки строки */
function isOrderStatus(s: string): s is OrderStatus {
  return (STATUSES as readonly string[]).includes(s as OrderStatus);
}

// Тип статуса, который ожидает модуль письма (отличается от Prisma)
type MailOrderStatus = Parameters<typeof readableStatus>[0];

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = (formData.get("id") as string | null) ?? "";
  const rawStatus = (formData.get("status") as string | null) ?? "";

  if (!id || !isOrderStatus(rawStatus)) {
    throw new Error("Invalid input");
  }

  // После проверки тип уже сужен — лишних утверждений не нужно
  const status = rawStatus;

  await db.order.update({ where: { id }, data: { status } });

  // История: смена статуса — таблицы может не быть в этой схеме
  try {
    const anyDb = db as unknown as {
      orderEvent?: { create?: (args: unknown) => Promise<unknown> };
    };
    await anyDb.orderEvent?.create?.({
      data: {
        orderId: id,
        type: "STATUS_CHANGED",
        message: `Статус изменён на ${status}`,
      },
    });
  } catch (e) {
    console.warn("[orders] orderEvent skipped:", (e as Error)?.message);
  }

  // Письмо пользователю — по настройке notifyOnStatusChange
  try {
    // Используем select, чтобы получить строго типизированный description
    const order = await db.order.findUnique({
      where: { id },
      select: {
        id: true,
        city: true,
        description: true,
        createdAt: true,
        dueDate: true,
        user: {
          select: { email: true, name: true, notifyOnStatusChange: true },
        },
      },
    });

    if (order?.user?.email && (order.user.notifyOnStatusChange ?? true)) {
      const appUrl = env.AUTH_URL ?? env.NEXTAUTH_URL ?? "";
      const mailStatus: MailOrderStatus = status as unknown as MailOrderStatus;

      await sendMail({
        to: order.user.email,
        subject: `Статус вашей заявки: ${readableStatus(mailStatus)}`,
        react: React.createElement(OrderStatusChangedEmail, {
          status: mailStatus,
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
  revalidatePath("/orders");
}
