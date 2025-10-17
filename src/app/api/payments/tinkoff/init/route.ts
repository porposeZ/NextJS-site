// src/app/api/payments/tinkoff/init/route.ts
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { env } from "~/server/env";

/**
 * Формирование Token по правилам T-Bank:
 * 1) Берём все поля (кроме Token) + добавляем Password
 * 2) Сортируем ключи по алфавиту
 * 3) Конкатенируем значения в одну строку
 * 4) SHA-256 -> hex lower
 * Для объектов (например, Receipt) используем JSON.stringify.
 */
function makeTinkoffToken(payload: Record<string, unknown>, password: string) {
  const data: Record<string, unknown> = { ...payload, Password: password };
  delete data.Token;

  const keys = Object.keys(data).sort((a, b) => a.localeCompare(b));
  const concat = keys
    .map((k) => {
      const v = data[k];
      if (v === null || v === undefined) return "";
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    })
    .join("");

  return crypto.createHash("sha256").update(concat).digest("hex");
}

export async function POST(req: Request) {
  if (!env.TINKOFF_TERMINAL_KEY || !env.TINKOFF_TERMINAL_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: "Payments not configured (TerminalKey/Password)" },
      { status: 500 }
    );
  }

  const { orderId, amountKopeks, description } = (await req.json()) as {
    orderId: string;
    amountKopeks: number;
    description?: string;
  };

  if (!orderId || !amountKopeks || amountKopeks < 1) {
    return NextResponse.json({ ok: false, error: "Bad input" }, { status: 400 });
  }

  // База для ссылок. Если в .env не задано, в dev упадём на localhost.
  const base =
    env.AUTH_URL ??
    env.NEXTAUTH_URL ??
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000");

  // ⬇ теперь ведём на /orders/success и /orders/fail
  const successUrl = env.PAYMENTS_SUCCESS_URL ?? (base ? `${base}/orders/success` : "");
  const failUrl = env.PAYMENTS_FAIL_URL ?? (base ? `${base}/orders/fail` : "");

  const bodyBase: Record<string, unknown> = {
    TerminalKey: env.TINKOFF_TERMINAL_KEY,
    Amount: amountKopeks,              // КОПЕЙКИ
    OrderId: orderId,
    Description: description?.slice(0, 140) ?? "Оплата заказа",
    SuccessURL: successUrl,
    FailURL: failUrl,
    Language: "ru",
  };

  // (опционально) Пробрасываем NotificationURL, чтобы не зависеть от настроек в кабинете
  if (base) {
    bodyBase.NotificationURL = `${base}/api/payments/tinkoff/callback`;
  }

  // Подписываем тело терминальным паролем
  const Token = makeTinkoffToken(bodyBase, env.TINKOFF_TERMINAL_PASSWORD);
  const body = { ...bodyBase, Token };

  const resp = await fetch("https://securepay.tinkoff.ru/v2/Init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // При схеме с Password заголовок Authorization НЕ нужен
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok || !data?.Success) {
    return NextResponse.json(
      { ok: false, error: data?.Message ?? "Init failed", raw: data },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    paymentId: data.PaymentId,
    paymentUrl: data.PaymentURL,
  });
}
