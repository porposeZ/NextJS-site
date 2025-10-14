"use server";

import { cookies, headers } from "next/headers";
import { db } from "~/server/db";

type Kind = "terms" | "privacy" | "marketing";

/** Запись согласий пользователя в БД */
export async function recordConsents(params: {
  userId: string;
  kinds: Kind[];
  ip?: string | null;
  ua?: string | null;
  docVersion?: string;
}) {
  if (!params.userId || !params.kinds?.length) return;

  const now = new Date();

  await db.consent.createMany({
    data: params.kinds.map((k) => ({
      userId: params.userId,
      kind: k,
      acceptedAt: now,
      ip: params.ip ?? undefined,
      userAgent: params.ua ?? undefined,
      docVersion: params.docVersion ?? "2025-10-13",
    })),
    skipDuplicates: true,
  });
}

/**
 * Читает временную куку consent.kinds, пишет согласия в БД
 * и удаляет куку.
 */
export async function attachConsentsFromCookie(userId: string) {
  const c = await cookies();
  const raw = c.get("consent.kinds")?.value;
  if (!raw) return;

  let kinds: Kind[] = [];
  let ip: string | undefined;
  let ua: string | undefined;
  let v: string | undefined;

  try {
    const p = JSON.parse(raw) as {
      kinds?: string[];
      ip?: string;
      ua?: string;
      v?: string;
    };

    const allow = new Set<Kind>(["terms", "privacy", "marketing"]);
    if (Array.isArray(p.kinds)) {
      kinds = p.kinds.filter((k): k is Kind => allow.has(k as Kind));
    }
    ip = p.ip;
    ua = p.ua;
    v = p.v;
  } catch {
    // игнор
  }

  const h = await headers();
  ip ??= h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? undefined;
  ua ??= h.get("user-agent") ?? undefined;

  if (kinds.length) {
    await recordConsents({
      userId,
      kinds,
      ip,
      ua,
      docVersion: v ?? "2025-10-13",
    });
  }

  // удаляем, чтобы не дублировать при следующих запросах
  c.delete("consent.kinds");
}
