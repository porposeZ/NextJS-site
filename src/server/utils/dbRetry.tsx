// src/server/utils/dbRetry.ts
import { db } from "~/server/db";

/** Ретраим кратковременные обрывы соединения с БД (Prisma P1017) */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  attempts = 2,
  delayMs = 150
): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e: any) {
      last = e;
      const code = e?.code ?? e?.meta?.code;
      const msg: string = e?.message ?? "";
      if (code !== "P1017" && !msg.includes("P1017")) break;
      try {
        await db.$connect();
      } catch {}
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw last;
}
