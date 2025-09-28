"use server";

import { z } from "zod";
import { getSession } from "~/server/auth/getSession";
import { db } from "~/server/db";
import { env } from "~/server/env";
import { sendMail } from "~/server/email/send";

import OrderReceivedUser from "~/emails/OrderReceivedUser";
import NewOrderAdmin from "~/emails/NewOrderAdmin";

const CreateOrderSchema = z.object({
  city: z.string().min(2, "Укажите город"),
  details: z.string().min(5, "Опишите задачу"),
  date: z.string().optional(), // пока не пишем в БД
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export async function createOrder(raw: CreateOrderInput) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, error: "NOT_AUTHENTICATED" as const };
  }

  // анти-спам: не больше N заказов за WINDOW минут
  const since = new Date(Date.now() - env.WINDOW_MINUTES * 60 * 1000);
  const count = await db.order.count({
    where: { userId: session.user.id, createdAt: { gte: since } },
  });
  if (count >= env.MAX_ORDERS_PER_WINDOW) {
    return { ok: false, error: "TOO_MANY_REQUESTS" as const };
  }

  const parsed = CreateOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const { city, details } = parsed.data;
  const order = await db.order.create({
    data: { userId: session.user.id, city, description: details },
  });

  // письмо пользователю
  try {
    if (session.user.email) {
      await sendMail({
        to: session.user.email,
        subject: "Ваша заявка принята",
        react: OrderReceivedUser({
          userName: session.user.name ?? null,
          city,
          description: details,
        }),
      });
    }
  } catch {
    // проглатываем — письмо не критично для UX
  }

  // письмо админу
  try {
    if (env.ADMIN_EMAIL) {
      await sendMail({
        to: env.ADMIN_EMAIL,
        subject: "Новая заявка",
        react: NewOrderAdmin({
          userEmail: session.user.email ?? null,
          userName: session.user.name ?? null,
          city,
          description: details,
        }),
      });
    }
  } catch {
    // проглатываем
  }

  return { ok: true as const, id: order.id };
}
