// src/app/actions/createOrder.ts
"use server";

import React from "react";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { env } from "~/server/env";
import { sendMail } from "~/server/email/send";
import NewOrderEmail from "~/emails/NewOrderEmail";
import OrderCreatedEmail from "~/emails/OrderCreatedEmail";
import { rateLimitUser } from "~/server/rateLimit";
import { isValidCity } from "~/lib/cities";

const Input = z.object({
  city: z
    .string()
    .trim()
    .refine((v) => isValidCity(v), { message: "INVALID_CITY" }),
  details: z.string().min(1, "Описание обязательно"),
  date: z.string().optional(), // YYYY-MM-DD
});

export type CreateOrderResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error:
        | "NOT_AUTHENTICATED"
        | "VALIDATION_ERROR"
        | "DB_ERROR"
        | "RATE_LIMIT";
    };

export async function createOrder(raw: unknown): Promise<CreateOrderResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "NOT_AUTHENTICATED" };

  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "VALIDATION_ERROR" };

  const { city, details, date } = parsed.data;

  // дата не в прошлом
  let dueDate: Date | undefined = undefined;
  if (date && date.trim()) {
    const d = new Date(`${date}T00:00:00.000Z`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return { ok: false, error: "VALIDATION_ERROR" };
    dueDate = d;
  }

  // Rate limit
  const allowed = await rateLimitUser("createOrder", userId, { max: 10, windowMinutes: 5 });
  if (!allowed) return { ok: false, error: "RATE_LIMIT" };

  try {
    const data: any = { userId, city, description: details, status: "REVIEW" };
    if (dueDate) data.dueDate = dueDate;

    const order = await db.order.create({
      data,
      select: {
        id: true,
        city: true,
        description: true,
        createdAt: true,
        dueDate: true,
        user: {
          select: {
            email: true,
            name: true,
            phone: true,
            notifyOnStatusChange: true,
          },
        },
      },
    });

    // история
    await db.orderEvent.create({
      data: { orderId: order.id, userId, type: "CREATED", message: "Заявка создана пользователем" },
    });

    const appUrl = env.AUTH_URL ?? env.NEXTAUTH_URL;

    // письмо админу
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminLink = `${appUrl}/admin/orders`;
      await sendMail({
        to: adminEmail,
        subject: "Новая заявка на сайте",
        react: React.createElement(NewOrderEmail, {
          order: {
            id: order.id,
            city: order.city,
            description: order.description,
            createdAt: order.createdAt,
            dueDate: order.dueDate ?? undefined,
          },
          user: {
            email: order.user?.email ?? "",
            name: order.user?.name ?? undefined,
            phone: order.user?.phone ?? undefined,
          },
          adminLink,
        }),
      }).catch((e) => console.warn("[email] admin new-order failed:", e));
    }

    // письмо пользователю
    if (order.user?.email && (order.user.notifyOnStatusChange ?? true)) {
      await sendMail({
        to: order.user.email,
        subject: "Заявка получена и принята в работу",
        react: React.createElement(OrderCreatedEmail, {
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
      }).catch((e) => console.warn("[email] user order-created failed:", e));
    }

    revalidatePath("/orders");
    return { ok: true, id: order.id };
  } catch (e) {
    console.error("[orders] create failed:", e);
    return { ok: false, error: "DB_ERROR" };
  }
}
