import { db } from "~/server/db";
import { requireAdmin } from "~/server/auth/roles";
import OrderCard from "./OrderCard";

export const metadata = { title: "Все заказы — Админ" };

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true, phone: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Все заказы</h1>

      {orders.length === 0 ? (
        <p className="text-slate-600">Пока нет заказов.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
