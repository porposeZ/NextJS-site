import { db } from "~/server/db";
import { requireAdmin } from "~/server/auth/roles";
import OrderCard from "./OrderCard";

export const metadata = { title: "Все заказы — Админ" };

type Search = {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireAdmin();

  const { q, status, from, to } = await searchParams;

  const where: any = {};

  // фильтр по статусу
  if (status && status.length) where.status = status as any;

  // фильтр по строке поиска
  if (q && q.trim().length) {
    const term = q.trim();
    where.OR = [
      { city: { contains: term } },          // без mode (SQLite)
      { description: { contains: term } },   // без mode (SQLite)
      { user: { is: { email: { contains: term } } } }, // связанное поле через `is`
    ];
  }

  // фильтр по дате создания
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(`${from}T00:00:00.000Z`);
    if (to) where.createdAt.lte = new Date(`${to}T23:59:59.999Z`);
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true, phone: true } },
      // последние 5 событий по заказу
      events: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Все заказы</h1>

      {/* Форма фильтра остается как у тебя в шаблоне (если была) */}

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
