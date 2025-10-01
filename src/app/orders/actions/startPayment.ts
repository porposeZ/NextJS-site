"use server";

import React from "react";
import { revalidatePath } from "next/cache";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { env } from "~/server/env";
import { sendMail } from "~/server/email/send";
import OrderStatusChangedEmail from "~/emails/OrderStatusChangedEmail";
// Update the import path if the file exists elsewhere, for example:
import PaymentMethodChosenEmail from "~/emails/PaymentMethodChosenEmail";
// Or create the file at src/emails/PaymentMethodChosenEmail.tsx if missing.

type PaymentMethod = "yookassa" | "card";

export async function startPayment(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const orderId = String(formData.get("orderId") ?? "");
  const paymentMethod = String(formData.get("paymentMethod") ?? "") as PaymentMethod;
  if (!orderId || !["yookassa", "card"].includes(paymentMethod)) {
    throw new Error("Invalid input");
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!order || order.userId !== userId) throw new Error("Not found");

  const appUrl = env.AUTH_URL ?? env.NEXTAUTH_URL;

  // 1) Письмо админу — какой способ выбрал пользователь
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && order.user?.email) {
    await sendMail({
      to: adminEmail,
      subject: "Пользователь выбрал способ оплаты",
      react: React.createElement(PaymentMethodChosenEmail, {
        order: {
          id: order.id,
          city: order.city,
          description: order.description,
          createdAt: order.createdAt,
          dueDate: order.dueDate ?? undefined,
        },
        userEmail: order.user.email,
        method: paymentMethod,
        adminLink: `${appUrl}/admin/orders`,
      }),
    }).catch((e) => console.warn("[email] admin payment-method failed:", e));
  }

  // 2) Письмо пользователю — напоминание/инструкции к оплате (тот же шаблон, что при смене статуса)
  if (order.user?.email) {
    await sendMail({
      to: order.user.email,
      subject: "Оплата заявки — инструкции",
      react: React.createElement(OrderStatusChangedEmail, {
        status: "AWAITING_PAYMENT",
        order: {
          id: order.id,
          city: order.city,
          description: order.description,
          createdAt: order.createdAt,
          dueDate: order.dueDate ?? undefined,
        },
        paymentMethod,
        appUrl,
        userName: order.user.name ?? undefined,
      }),
    }).catch((e) => console.warn("[email] user payment-instruction failed:", e));
  }

  revalidatePath("/orders");
  return { ok: true as const };
}
