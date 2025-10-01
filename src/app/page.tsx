import { db } from "~/server/db";
import { auth } from "~/server/auth";
import HomeClient from "./HomeClient";

export const metadata = { title: "Я есть — главная" };

export default async function HomePage() {
  const session = await auth();
  const user =
    session?.user?.id
      ? await db.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, email: true, phone: true },
        })
      : null;

  return <HomeClient user={user ?? undefined} />;
}
