import { NextResponse } from "next/server";
import { db } from "~/server/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";

  if (!token) {
    return NextResponse.redirect(new URL("/profile?email=invalid", req.url));
  }

  const rec = await db.emailChangeToken.findUnique({ where: { token } });
  if (!rec || rec.expires < new Date()) {
    // просрочен или не найден
    return NextResponse.redirect(new URL("/profile?email=expired", req.url));
  }

  // применяем новый email, проверяем конфликты
  const exists = await db.user.findFirst({ where: { email: rec.newEmail } });
  if (exists) {
    // уже кем-то занят — просто удаляем токен и кидаем ошибку
    await db.emailChangeToken.delete({ where: { token } });
    return NextResponse.redirect(new URL("/profile?email=taken", req.url));
  }

  await db.$transaction([
    db.user.update({
      where: { id: rec.userId },
      data: { email: rec.newEmail },
    }),
    db.emailChangeToken.delete({ where: { token } }),
  ]);

  return NextResponse.redirect(new URL("/profile?email=ok", req.url));
}
