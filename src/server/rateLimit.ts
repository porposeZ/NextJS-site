import { db } from "./db";

/**
 * Простой rate-limit на пользователя.
 * Возвращает false, если достигнут лимит за окно времени.
 */
export async function rateLimitUser(
  keyBase: string,
  userId: string,
  { max = 5, windowMinutes = 5 }: { max?: number; windowMinutes?: number } = {},
) {
  const key = `${keyBase}:${userId}`;
  const since = new Date(Date.now() - windowMinutes * 60_000);

  const count = await db.actionLog.count({
    where: { key, createdAt: { gte: since } },
  });

  if (count >= max) return false;

  await db.actionLog.create({ data: { key } });
  return true;
}
