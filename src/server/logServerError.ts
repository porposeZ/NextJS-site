import { headers } from "next/headers";

/**
 * Пишет развёрнутую серверную ошибку в Runtime Logs (Vercel).
 * В Next.js 15 headers()/cookies() — async, поэтому используем await.
 */
export async function logServerError(
  scope: string,
  err: unknown,
  extra: Record<string, unknown> = {},
) {
  // Значения по умолчанию — на случай, если headers() недоступен
  let rid = "no-request-id";
  let ua = "n/a";
  let ip = "n/a";
  let ref = "n/a";

  try {
    const h = await headers();
    rid = h.get("x-vercel-id") || h.get("x-request-id") || rid;
    ua = h.get("user-agent") || ua;
    ip = h.get("x-forwarded-for") || ip;
    ref = h.get("referer") || ref;
  } catch {
    // заголовки недоступны (например, вне запроса) — игнорируем
  }

  const e = err as { code?: string; message?: string; stack?: string };

  // Эта запись появится в Vercel → Deployments → Runtime Logs
  console.error(`[${scope}]`, {
    requestId: rid,
    ip,
    ua,
    referer: ref,
    prismaCode: e?.code,
    message: e?.message ?? String(err),
    stack: e?.stack,
    ...extra,
  });
}
