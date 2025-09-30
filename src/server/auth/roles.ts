import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { env } from "~/server/env";

export async function isAdmin() {
  const session = await auth();
  const admin = env.ADMIN_EMAIL?.toLowerCase();
  const email = session?.user?.email?.toLowerCase();
  return !!admin && !!email && admin === email;
}

export async function requireAdmin() {
  const session = await auth();
  const ok = await isAdmin();
  if (!ok) {
    // Если не залогинен — предложим войти и вернёмся в админку
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/admin/orders");
    // Если залогинен, но не админ — на главную
    redirect("/");
  }
  return session!;
}
