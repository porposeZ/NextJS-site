"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";

export async function clearSessions() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false as const };

  // удалим все сессии кроме текущей
  const currentToken = (session as any)?.sessionToken as string | undefined;
  await db.session.deleteMany({
    where: {
      userId,
      ...(currentToken ? { NOT: { sessionToken: currentToken } } : {}),
    },
  });

  revalidatePath("/profile");
  return { ok: true as const };
}
