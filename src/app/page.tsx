import HomeClient from "./HomeClient";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export const metadata = { title: "Я есть — поручения" };

export default async function HomePage() {
  const session = await auth();
  const user = session?.user?.id
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, phone: true, defaultCity: true },
      })
    : null;

  return <HomeClient user={user ?? undefined} />;
}
