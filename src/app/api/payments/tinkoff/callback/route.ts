// src/app/api/payments/tinkoff/callback/route.ts
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { env } from "~/server/env";
import { db } from "~/server/db";

// формируем Token по правилам T-Bank (см. init)
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

// маппинг статусов T-Bank -> наши статусы заказа
function resolveOrderStatus(tStatus: string) {
  const s = tStatus.toUpperCase();
  if (["AUTHORIZED", "CONFIRMED"].includes(s)) return "IN_PROGRESS" as const;
  if (["REJECTED", "REVERSED", "PARTIAL_REVERSED", "CANCELED"].includes(s)) {
    return "CANCELED" as const;
  }
  // оставляем как есть для прочих состояний
  return null;
}

export async function POST(req: Request) {
  try {
    if (!env.TINKOFF_TERMINAL_KEY || !env.TINKOFF_TERMINAL_PASSWORD) {
      return NextResponse.json(
        { ok: false, error: "Payments not configured" },
        { status: 500 }
      );
    }

    const payload = (await req.json()) as Record<string, unknown>;
    const theirToken = String(payload.Token ?? "");
    if (!theirToken) {
      return NextResponse.json({ ok: false, error: "No token" }, { status: 400 });
    }

    // проверяем подпись
    const myToken = makeTinkoffToken(payload, env.TINKOFF_TERMINAL_PASSWORD);
    if (myToken.toLowerCase() !== theirToken.toLowerCase()) {
      return NextResponse.json({ ok: false, error: "Bad token" }, { status: 401 });
    }

    const orderId = String(payload.OrderId ?? "");
    const tStatus = String(payload.Status ?? "");

    if (!orderId || !tStatus) {
      return NextResponse.json({ ok: false, error: "Bad payload" }, { status: 400 });
    }

    const next = resolveOrderStatus(tStatus);
    if (next) {
      // пытаемся обновить; если заказа нет — не падаем
      await db.order
        .update({
          where: { id: orderId },
          data: { status: next },
        })
        .catch(() => {});
    }

    // Ответ по спецификации — "OK"
    return new NextResponse("OK", { status: 200 });
  } catch (e) {
    console.error("[tinkoff callback] error:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
