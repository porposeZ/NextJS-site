import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { env } from "~/server/env";
import { db } from "~/server/db";

// Тип колбэка от T-Bank (минимально нужные поля)
type TinkoffCallbackPayload = {
  Token?: string;
  Status?: string;
  OrderId?: string;
  DATA?: { baseOrderId?: string } | null;
  [k: string]: unknown;
};

// Подпись ровно как в init
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

function resolveOrderStatus(tStatus: string) {
  const s = (tStatus || "").toUpperCase();
  if (["AUTHORIZED", "CONFIRMED"].includes(s)) return "IN_PROGRESS" as const;
  if (["REJECTED", "REVERSED", "PARTIAL_REVERSED", "CANCELED"].includes(s)) {
    return "CANCELED" as const;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const terminalPassword = String(env.TINKOFF_TERMINAL_PASSWORD ?? "")
      .replace(/\r|\n/g, "")
      .trim();

    if (!env.TINKOFF_TERMINAL_KEY || !terminalPassword) {
      return NextResponse.json({ ok: false, error: "Payments not configured" }, { status: 500 });
    }

    const payload = (await req.json()) as TinkoffCallbackPayload;
    const theirToken = String(payload.Token ?? "");
    if (!theirToken) {
      return NextResponse.json({ ok: false, error: "No token" }, { status: 400 });
    }

    const myToken = makeTinkoffToken(payload as Record<string, unknown>, terminalPassword);
    if (myToken.toLowerCase() !== theirToken.toLowerCase()) {
      return NextResponse.json({ ok: false, error: "Bad token" }, { status: 401 });
    }

    const tStatus = String(payload.Status ?? "");

    // Если в init не отправляли DATA — берём часть до суффикса
    const rawOrderId = String(payload.OrderId ?? "");
    const baseOrderId: string =
      payload.DATA?.baseOrderId || rawOrderId.split("-")[0] || rawOrderId;

    if (!baseOrderId || !tStatus) {
      return NextResponse.json({ ok: false, error: "Bad payload" }, { status: 400 });
    }

    const next = resolveOrderStatus(tStatus);
    if (next) {
      await db.order
        .update({ where: { id: baseOrderId }, data: { status: next } })
        .catch(() => {});
    }

    return new NextResponse("OK", { status: 200 });
  } catch (e) {
    console.error("[tinkoff callback] error:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
