// src/app/actions/createOrder.ts
"use server";

import React from "react";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { env } from "~/server/env";
import { sendMail } from "~/server/email/send";
import NewOrderEmail from "~/emails/NewOrderEmail";
import { attachConsentsFromCookie } from "~/server/consents";

/**
 * Поля, которые присылает форма на главной:
 * - city, details, date, phone
 */
const Input = z.object({
  city: z.string().trim().min(1, "Город обязателен"),
  details: z.string().trim().min(1, "Описание обязательно"),
  date: z.string().trim().min(1, "Дата обязательна"), // YYYY-MM-DD
  phone: z.string().optional().transform((v) => (v ?? "").trim()),
});

/** Старый тип результата — оставляем для совместимости */
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

/**
 * Универсальная функция:
 * - если пришёл FormData (Server Action формы) → создаёт заказ и делает redirect("/thanks")
 * - если пришёл произвольный объект (старый вызов) → возвращает { ok, id } без редиректа
 */
export async function createOrder(
  raw: unknown
): Promise<CreateOrderResult | void> {
  const session = await auth();
  const userId = session?.user?.id;

  // форма должна редиректить на логин
  if (!userId) {
    redirect("/api/auth/signin");
  }

  // Преобразуем вход в обычный объект, независимо от того FormData это или plain object
  const asObject =
    typeof FormData !== "undefined" && raw instanceof FormData
      ? Object.fromEntries(raw.entries())
      : (raw as Record<string, unknown>);

  const parsed = Input.safeParse(asObject);
  if (!parsed.success) {
    // В режиме Server Action (FormData) — просто не редиректим, чтобы форма могла показать ошибки (если нужно).
    // Совместимость со старым типом:
    if (!(raw instanceof FormData)) {
      return { ok: false, error: "VALIDATION_ERROR" };
    }
    return;
  }

  const { city, details, date, phone: rawPhone } = parsed.data;

  // Нормализуем телефон и дату
  const digits = (rawPhone ?? "").replace(/\D/g, "");
  const normalizedPhone = digits.length ? `+${digits}` : null;

  const due = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(due.getTime())) {
    if (!(raw instanceof FormData)) {
      return { ok: false, error: "VALIDATION_ERROR" };
    }
    return;
  }

  try {
    // привяжем согласия из куки к userId при первом осмысленном действии
    try {
      await attachConsentsFromCookie(userId);
    } catch {
      // не роняем заказ, если что-то пошло не так
    }

    // сохраним телефон пользователя (если прислан)
    if (normalizedPhone) {
      try {
        await db.user.update({
          where: { id: userId },
          data: { phone: normalizedPhone },
        });
      } catch (e) {
        const code = (e as { code?: string } | null)?.code;
        if (code !== "P2002") {
          // игнорируем уникальные конфликты и т.п., чтобы не мешать созданию заказа
          console.warn("[orders] user phone update skipped:", e);
        }
      }
    }

    // создаём заказ (status берётся по умолчанию из схемы — REVIEW)
    const order = await db.order.create({
      data: {
        userId,
        city,
        description: details, // маппим details -> description
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

    // письмо админу (если указан)
    const adminEmail = env.ADMIN_EMAIL;
    if (adminEmail) {
      try {
        const base = env.AUTH_URL ?? env.NEXTAUTH_URL ?? "";
        const adminLink = `${base}/admin/orders`;
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
        });
      } catch (e) {
        console.warn("[email] admin new-order failed:", e);
      }
    }

    // Обновим кэш списков
    revalidatePath("/orders");
    revalidatePath("/admin/orders");

    // --- Результат в зависимости от режима вызова ---
    if (raw instanceof FormData) {
      // Server Action формы → сразу на спасибо
      redirect("/thanks");
    } else {
      // старый программный вызов → вернём id
      return { ok: true, id: order.id };
    }
  } catch (e) {
    console.error("[orders] create failed:", e);
    if (!(raw instanceof FormData)) {
      return { ok: false, error: "DB_ERROR" };
    }
    // в режиме формы просто ничего не возвращаем — оставим страницу как есть
  }
}
