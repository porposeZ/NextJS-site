"use server";

import React from "react";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { requireAdmin } from "~/server/auth/roles";
import { sendMail } from "~/server/email/send";
import OrderStatusChangedEmail, { readableStatus } from "~/emails/OrderStatusChangedEmail";
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
    return { ok: false as const, error: "INVALID_INPUT" as const };
  }

  // цена может прийти из инпута как строка рублей
  // допускаем пустое значение — тогда не трогаем budget
  const rawPrice = (formData.get("price") as string | null) ?? "";
  let priceRub: number | undefined;
  if (rawPrice.trim() !== "") {
    const n = Number(rawPrice);
    if (Number.isFinite(n) && n >= 0) priceRub = Math.floor(n);
  }

  const status = rawStatus;

  // ⚠️ Больше НЕ бросаем ошибку при AWAITING_PAYMENT без цены.
  // Если priceRub задан — запишем в budget; если нет — оставим как есть.
  try {
    await db.order.update({
      where: { id },
      data: {
        status,
        ...(typeof priceRub === "number" ? { budget: priceRub } : {}),
      },
    });

    // История (если таблица есть)
    try {
      const anyDb = db as unknown as {
        orderEvent?: { create?: (args: unknown) => Promise<unknown> };
      };
      await anyDb.orderEvent?.create?.({
        data: {
          orderId: id,
          type: "STATUS_CHANGED",
          message:
            status === "AWAITING_PAYMENT" && typeof priceRub === "number"
              ? `Статус изменён на ${status}. Назначена стоимость ${priceRub} ₽`
              : `Статус изменён на ${status}`,
        },
      });
    } catch (e) {
      console.warn("[orders] orderEvent skipped:", (e as Error)?.message);
    }
  } catch (e) {
    console.error("[orders] update failed:", e);
    return { ok: false as const, error: "DB_ERROR" as const };
  }

  // Письмо пользователю (если включено)
  try {
    const order = await db.order.findUnique({
      where: { id },
      select: {
        id: true,
        city: true,
        description: true,
        createdAt: true,
        dueDate: true,
        user: { select: { email: true, name: true, notifyOnStatusChange: true } },
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

  // Обновим и админку, и пользовательские заказы
  revalidatePath("/admin/orders");
  revalidatePath("/orders");

  // Если цену не передали при AWAITING_PAYMENT — вернём предупреждение (можно показать в UI)
  const warnings: string[] = [];
  if (status === "AWAITING_PAYMENT" && typeof priceRub !== "number") {
    warnings.push("PRICE_MISSING");
  }

  return { ok: true as const, warnings };
}
