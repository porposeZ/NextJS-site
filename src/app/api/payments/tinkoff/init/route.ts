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
  delete (data as { Token?: unknown }).Token;

  const concat = Object.keys(data)
    .sort((a, b) => a.localeCompare(b))
    .map((k) => {
      const v = data[k];
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

type TinkoffInitBody = {
  TerminalKey: string;
  Amount: number; // копейки
  OrderId: string;
  Description?: string;
  SuccessURL?: string;
  FailURL?: string;
  NotificationURL?: string;
  DATA?: Record<string, unknown>;
};

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
    const bodyBase: TinkoffInitBody = {
      TerminalKey: terminalKey,
      Amount: Math.trunc(amountKopeks), // копейки, целое число
      OrderId: payOrderId,
      Description: (description ?? "Оплата заказа").slice(0, 140),
    };

    /**
     * УДОБСТВА (включаются флагом).
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

      if (successUrl) bodyBase.SuccessURL = successUrl;
      if (failUrl) bodyBase.FailURL = failUrl;
      if (notificationUrl) bodyBase.NotificationURL = notificationUrl;
      bodyBase.DATA = { baseOrderId: orderId };
    }

    // Подписываем ровно то, что отправим
    const Token = makeTinkoffToken(bodyBase, terminalPassword);
    const body = { ...bodyBase, Token };

    const resp = await fetch("https://securepay.tinkoff.ru/v2/Init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data: unknown = await resp.json().catch(() => ({}));

    // Безопасное извлечение Success
    const success = typeof data === "object" && data !== null && (data as { Success?: boolean }).Success;

    if (!resp.ok || !success) {
      const d = (data ?? {}) as Record<string, unknown>;
      console.error("[tinkoff Init] fail:", {
        httpStatus: resp.status,
        message: d?.Message,
        details: d?.Details,
        errorCode: d?.ErrorCode,
        sent: bodyBase,
      });

      const errText =
        (d?.Message as string | undefined) ||
        (d?.Details as string | undefined) ||
        (d?.ErrorCode as string | undefined) ||
        `Init failed (HTTP ${resp.status})`;

      return NextResponse.json({ ok: false, error: String(errText), raw: d }, { status: 500 });
    }

    const d = data as { PaymentId?: string; PaymentURL?: string };
    return NextResponse.json({
      ok: true,
      paymentId: d.PaymentId,
      paymentUrl: d.PaymentURL,
    });
  } catch (e) {
    console.error("[tinkoff Init] exception:", e);
    return NextResponse.json({ ok: false, error: "NETWORK_OR_SERVER_ERROR" }, { status: 500 });
  }
}
