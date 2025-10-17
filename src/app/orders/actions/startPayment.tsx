// src/app/orders/actions/startPayment.ts
"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";
import { env } from "~/server/env";

type StartPaymentOk = { ok: true; paymentUrl: string; paymentId?: string };
type StartPaymentFail = { ok: false; error: string };
export type StartPaymentResult = StartPaymentOk | StartPaymentFail;

/**
 * Старт оплаты со стороны пользователя.
 * Ждёт:
 *  - orderId: string
 *  - paymentMethod: "yookassa" | "card"   (внутренний маркер)
 */
export async function startPayment(
  formData: FormData
): Promise<StartPaymentResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "NOT_AUTHENTICATED" };

  const orderId = (formData.get("orderId") as string | null) ?? "";
  const paymentMethod = (formData.get("paymentMethod") as string | null) ?? "";
  if (!orderId || !["yookassa", "card"].includes(paymentMethod)) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  // Проверяем, что заказ принадлежит текущему пользователю
  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    select: { id: true, description: true, budget: true },
  });
  if (!order) return { ok: false, error: "ORDER_NOT_FOUND" };

  // Сумма: из budget (в рублях) или дефолт 100 ₽
  const amountRub =
    typeof order.budget === "number" && order.budget > 0 ? order.budget : 100;
  const amountKopeks = Math.round(amountRub * 100);

  // Абсолютный базовый URL (важно в проде)
  const base =
    env.AUTH_URL ??
    env.NEXTAUTH_URL ??
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000");
  if (!base) return { ok: false, error: "BASE_URL_NOT_CONFIGURED" };

  const url = new URL("/api/payments/tinkoff/init", base).toString();

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        amountKopeks,
        description:
          (order.description ?? "").slice(0, 140) || "Оплата заказа",
      }),
      cache: "no-store",
    });

    let data: any = null;
    try {
      data = await r.json();
    } catch {
      /* ignore */
    }

    if (!r.ok || !data?.ok || !data.paymentUrl) {
      return {
        ok: false,
        error: data?.error ?? `INIT_FAILED_${r.status}`, // ← были потеряны backticks
      };
    }

    // Пусть список заказов обновится «на всякий»
    revalidatePath("/orders");

    return {
      ok: true,
      paymentUrl: String(data.paymentUrl),
      paymentId: data.paymentId ? String(data.paymentId) : undefined,
    };
  } catch (e) {
    console.error("[startPayment] fetch error:", e);
    return { ok: false, error: "NETWORK_ERROR" };
  }
}
