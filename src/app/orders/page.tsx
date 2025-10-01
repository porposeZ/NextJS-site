import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import UserOrderCard from "./UserOrderCard";

export const metadata = { title: "Мои заказы" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/orders");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      events: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Мои заказы</h1>

      {orders.length === 0 ? (
        <p className="text-slate-600">Заказов пока нет.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <UserOrderCard key={o.id} order={o as any} />
          ))}
        </div>
      )}
    </div>
  );
}
