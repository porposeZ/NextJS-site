import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { env } from "~/server/env";

/**
 * SHA-256 подпись по Password-методу T-Bank.
 * Берём ВСЕ поля тела (кроме Token) + Password, сортируем ключи, конкатенируем значения.
 * Для объектов — JSON.stringify без пробелов.
 */
function makeTinkoffToken(payload: Record<string, unknown>, password: string) {
  const data: Record<string, unknown> = { ...payload, Password: password };
  delete (data as any).Token;

  const concat = Object.keys(data)
    .sort((a, b) => a.localeCompare(b))
    .map((k) => {
      const v = (data as any)[k];
      if (v === null || v === undefined) return "";
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    })
    .join("");

  return crypto.createHash("sha256").update(concat).digest("hex");
}

function shortAttemptId() {
  return Math.random().toString(36).slice(2, 8);
}

export async function POST(req: Request) {
  try {
    const terminalKey = String(env.TINKOFF_TERMINAL_KEY ?? "").trim();
    const terminalPassword = String(env.TINKOFF_TERMINAL_PASSWORD ?? "")
      .replace(/\r|\n/g, "")
      .trim();

    if (!terminalKey || !terminalPassword) {
      return NextResponse.json(
        { ok: false, error: "Payments not configured (TerminalKey/Password missing)" },
        { status: 500 },
      );
    }

    const { orderId, amountKopeks, description } = (await req.json()) as {
      orderId: string;
      amountKopeks: number;
      description?: string;
    };

    if (!orderId || !Number.isFinite(amountKopeks) || amountKopeks < 1) {
      return NextResponse.json({ ok: false, error: "Bad input" }, { status: 400 });
    }

    // Уникализируем OrderId, чтобы не ловить «Заказ уже существует»
    const attempt = shortAttemptId();
    let payOrderId = `${orderId}-${attempt}`;
    if (payOrderId.length > 40) payOrderId = payOrderId.slice(-40);

    // Минимально достаточное тело — это работает надёжно в демо
    const bodyBase: Record<string, unknown> = {
      TerminalKey: terminalKey,
      Amount: Math.trunc(amountKopeks), // копейки, целое число
      OrderId: payOrderId,
      Description: (description ?? "Оплата заказа").slice(0, 140),
    };

    /**
     * УДОБСТВА (включаются флагом).
     * Бывает, что в демо-терминалах T-Bank из-за их канонизации некоторых полей
     * подпись перестаёт сходиться. Поэтому по умолчанию не добавляем.
     * В проде можно включить переменной:
     *   TINKOFF_SEND_URLS="true"
     */
    const sendUrls = String(process.env.TINKOFF_SEND_URLS ?? "").toLowerCase() === "true";

    if (sendUrls) {
      const base =
        env.AUTH_URL ??
        env.NEXTAUTH_URL ??
        (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000");

      const successUrl = env.PAYMENTS_SUCCESS_URL ?? (base ? `${base}/orders/success` : "");
      const failUrl = env.PAYMENTS_FAIL_URL ?? (base ? `${base}/orders/fail` : "");
      const notificationUrl = base ? `${base}/api/payments/tinkoff/callback` : "";

      if (successUrl) (bodyBase as any).SuccessURL = successUrl;
      if (failUrl) (bodyBase as any).FailURL = failUrl;
      if (notificationUrl) (bodyBase as any).NotificationURL = notificationUrl;

      // Метаданные — полезно для обратной связи (колбэк)
      (bodyBase as any).DATA = { baseOrderId: orderId };
    }

    // ВАЖНО: подписываем именно тот объект, который отправим
    const Token = makeTinkoffToken(bodyBase, terminalPassword);
    const body = { ...bodyBase, Token };

    const resp = await fetch("https://securepay.tinkoff.ru/v2/Init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data: any = await resp.json().catch(() => ({}));

    if (!resp.ok || !data?.Success) {
      console.error("[tinkoff Init] fail:", {
        httpStatus: resp.status,
        message: data?.Message,
        details: data?.Details,
        errorCode: data?.ErrorCode,
        sent: bodyBase, // без Token/Password
      });

      const errText =
        data?.Message || data?.Details || data?.ErrorCode || `Init failed (HTTP ${resp.status})`;

      return NextResponse.json({ ok: false, error: String(errText), raw: data }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      paymentId: data.PaymentId,
      paymentUrl: data.PaymentURL,
    });
  } catch (e) {
    console.error("[tinkoff Init] exception:", e);
    return NextResponse.json({ ok: false, error: "NETWORK_OR_SERVER_ERROR" }, { status: 500 });
  }
}
