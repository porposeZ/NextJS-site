"use server";

import React from "react";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { env } from "~/server/env";
import { sendMail } from "~/server/email/send";
import NewOrderEmail from "~/emails/NewOrderEmail";

const Input = z.object({
  city: z.string().min(1, "Город обязателен"),
  details: z.string().min(1, "Описание обязательно"),
  date: z.string().min(1, "Дата обязательна"), // YYYY-MM-DD
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

  // формируем dueDate; простой валидатор
  const due = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(due.getTime()))
    return { ok: false, error: "VALIDATION_ERROR" };

  try {
    const order = await db.order.create({
      data: {
        userId,
        city,
        description: details,
        status: "REVIEW",
        dueDate: due,
      },
      select: {
        id: true,
        city: true,
        description: true,
        createdAt: true,
        dueDate: true,
        user: { select: { email: true, name: true, phone: true } },
      },
    });

    // письмо админу (если указан ADMIN_EMAIL)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminLink = `${env.AUTH_URL ?? env.NEXTAUTH_URL}/admin/orders`;
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

    revalidatePath("/orders");
    return { ok: true, id: order.id };
  } catch (e) {
    console.error("[orders] create failed:", e);
    return { ok: false, error: "DB_ERROR" };
  }
}
