import type { Session } from "next-auth";
import { auth } from "~/server/auth";

// Возвращаем ту же сессию, что и везде по проекту (через auth()).
export type SafeSession = Session | null;

export async function getSession(): Promise<SafeSession> {
  return auth();
}
