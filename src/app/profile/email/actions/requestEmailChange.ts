"use server";

import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { randomBytes } from "crypto";
import { addHours } from "date-fns";

const EmailSchema = z.string().email().max(190);

export async function requestEmailChange(rawEmail: unknown): Promise<
  | { ok: true }
  | { ok: false; error: "NOT_AUTH" | "INVALID_EMAIL" | "EMAIL_TAKEN" | "DB_ERROR" }
> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "NOT_AUTH" };

  const parsed = EmailSchema.safeParse(rawEmail);
  if (!parsed.success) return { ok: false, error: "INVALID_EMAIL" };
  const newEmail = parsed.data.toLowerCase();

  // Проверим, что email свободен
  const taken = await db.user.findFirst({ where: { email: newEmail } });
  if (taken) return { ok: false, error: "EMAIL_TAKEN" };

  try {
    // Удалим старые незавершённые заявки
    await db.emailChangeToken.deleteMany({ where: { userId } });

    const token = randomBytes(32).toString("hex");
    const expires = addHours(new Date(), 24);

    await db.emailChangeToken.create({
      data: { userId, newEmail, token, expires },
    });

    // Здесь интеграция с Resend (или иным провайдером):
    // const link = `${process.env.NEXT_PUBLIC_BASE_URL}/profile/confirm-email?token=${token}`
    // await resend.emails.send({...})

    // Пока — выводим ссылку в логи сервера, чтобы можно было кликнуть вручную
    console.log(
      "[email-change] confirm link:",
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/profile/confirm-email?token=${token}`
    );

    return { ok: true };
  } catch (e) {
    console.error("[email-change] request failed:", e);
    return { ok: false, error: "DB_ERROR" };
  }
}
