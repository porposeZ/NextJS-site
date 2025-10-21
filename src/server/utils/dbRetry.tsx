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
    } catch (e: unknown) {
      last = e;
      const err = e as { code?: string; meta?: { code?: string }; message?: string };
      const code = err?.code ?? err?.meta?.code;
      const msg = err?.message ?? "";
      if (code !== "P1017" && !msg.includes("P1017")) break;

      try {
        await db.$connect();
      } catch {
        // ignore reconnect error and still wait a bit
      }
      await new Promise<void>((r) => setTimeout(r, delayMs));
    }
  }
  throw last;
}
