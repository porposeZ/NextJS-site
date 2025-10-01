import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Card } from "~/components/ui/card";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Личный кабинет" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/profile");

  const [user, sessions] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        image: true,
        defaultCity: true,
        notifyOnStatusChange: true,
        notifyOnPayment: true,
      },
    }),
    db.session.count({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="mx-auto mt-8 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Личный кабинет</h1>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <img
            src={user?.image || `https://www.gravatar.com/avatar/?d=identicon`}
            alt="Avatar"
            className="h-12 w-12 rounded-full bg-slate-200 object-cover"
          />
          <div className="text-sm text-slate-600">
            Почта (логин): <b>{user?.email ?? "—"}</b>
            <div className="text-xs text-slate-500">Активных сессий: {sessions}</div>
          </div>
        </div>

        <ProfileForm
          initial={{
            name: user?.name ?? "",
            phone: user?.phone ?? "",
            image: user?.image ?? "",
            defaultCity: user?.defaultCity ?? "",
            notifyOnStatusChange: user?.notifyOnStatusChange ?? true,
            notifyOnPayment: user?.notifyOnPayment ?? true,
          }}
        />
      </Card>

      <Card className="p-6">
        <h2 className="mb-2 text-lg font-semibold">Данные</h2>
        <p className="text-sm text-slate-600">
          Вы можете скачать все свои данные (профиль, заказы, история событий) в формате JSON.
        </p>
        <a
          href="/profile/export"
          className="mt-3 inline-block rounded bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700"
        >
          Выгрузить мои данные (JSON)
        </a>
      </Card>
    </div>
  );
}
