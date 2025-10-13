"use server";

import { cookies, headers } from "next/headers";

/**
 * Кладём согласия во временную httpOnly-куку.
 * Потом первый серверный экшен привяжет их к userId и удалит куку.
 */
export async function stashConsentCookie(kinds: string[]) {
  const h = await headers();
  const c = await cookies();

  const ip =
    h.get("x-forwarded-for") ??
    h.get("x-real-ip") ??
    undefined;

  const ua = h.get("user-agent") ?? undefined;

  const payload = JSON.stringify({
    kinds, // ["terms","privacy", "marketing?"]
    ip,
    ua,
    ts: Date.now(),
    v: "2025-10-13",
  });

  c.set("consent.kinds", payload, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 дней
  });
}
