// app/api/consents/attach/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { cookies, headers } from "next/headers";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { ConsentKind } from "@prisma/client";

/**
 * Переносит согласия из кук (consent_*) в таблицу Consent
 * и очищает эти куки. Вызывается после входа.
 */
export async function POST(_req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: true, skipped: "anonymous" });
  }

  // ⬇️ в v15 cookies()/headers() — промисы
  const c = await cookies();
  const hasPolicy = c.get("consent_policy")?.value === "1";
  const wantsOrders = c.get("consent_order_emails")?.value === "1";
  const wantsMarketing = c.get("consent_marketing")?.value === "1";
  const email = c.get("consent_email")?.value ?? undefined;

  if (!hasPolicy && !wantsOrders && !wantsMarketing) {
    return NextResponse.json({ ok: true, empty: true });
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    undefined;
  const userAgent = h.get("user-agent") ?? undefined;

  const now = new Date();
  const DOC_VERSION = "v1.0";

  const existing = await db.consent.findMany({ where: { userId } });
  const byKind = new Map(existing.map((x) => [x.kind, x]));

  const tasks: Promise<unknown>[] = [];

  // 1) Политики (terms + privacy)
  if (hasPolicy) {
    for (const kind of [ConsentKind.privacy, ConsentKind.terms] as const) {
      const prev = byKind.get(kind);
      if (prev) {
        tasks.push(
          db.consent.update({
            where: { id: prev.id },
            data: {
              acceptedAt: now,
              policyAt: now,
              email,
              ip,
              userAgent,
              docVersion: DOC_VERSION,
            },
          }),
        );
      } else {
        tasks.push(
          db.consent.create({
            data: {
              userId,
              email,
              kind,
              acceptedAt: now,
              policyAt: now,
              ip,
              userAgent,
              docVersion: DOC_VERSION,
            },
          }),
        );
      }
    }
  }

  // 2) Коммуникации (marketing)
  if (wantsOrders || wantsMarketing) {
    const prev = byKind.get(ConsentKind.marketing);
    const data: Record<string, unknown> = {
      email,
      ip,
      userAgent,
      docVersion: DOC_VERSION,
    };
    if (wantsOrders) data.orderEmailsAt = now;
    if (wantsMarketing) data.marketingAt = now;

    if (prev) {
      tasks.push(db.consent.update({ where: { id: prev.id }, data }));
    } else {
      tasks.push(
        db.consent.create({
          data: {
            userId,
            kind: ConsentKind.marketing,
            acceptedAt: now,
            ...data,
          },
        }),
      );
    }
  }

  await Promise.allSettled(tasks);

  // чистим куки
  const res = NextResponse.json({ ok: true, saved: true });
  for (const name of [
    "consent_policy",
    "consent_order_emails",
    "consent_marketing",
    "consent_email",
  ]) {
    res.cookies.set(name, "", { maxAge: 0, path: "/" });
  }
  return res;
}
