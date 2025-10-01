import { db } from "~/server/db";
import { requireAdmin } from "~/server/auth/roles";
import OrderCard from "./OrderCard";

export const metadata = { title: "Все заказы — Админ" };

type Search = {
  q?: string;
  status?: "REVIEW" | "AWAITING_PAYMENT" | "IN_PROGRESS" | "DONE" | "CANCELED";
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireAdmin();

  const { q, status, from, to } = await searchParams;

  const where: any = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { city: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }
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
      events: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Все заказы</h1>

      {/* Фильтры как форма GET */}
      <form className="grid grid-cols-1 gap-3 rounded-md border p-3 md:grid-cols-5" method="get">
        <input
          type="text"
          name="q"
          placeholder="Поиск (город, описание, email)"
          defaultValue={q ?? ""}
          className="col-span-2 rounded border px-2 py-1 text-sm"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded border px-2 py-1 text-sm">
          <option value="">Все статусы</option>
          <option value="REVIEW">REVIEW</option>
          <option value="AWAITING_PAYMENT">AWAITING_PAYMENT</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
          <option value="CANCELED">CANCELED</option>
        </select>
        <input type="date" name="from" defaultValue={from ?? ""} className="rounded border px-2 py-1 text-sm" />
        <input type="date" name="to" defaultValue={to ?? ""} className="rounded border px-2 py-1 text-sm" />
        <button className="rounded bg-sky-600 px-3 py-1 text-sm text-white">Фильтровать</button>
      </form>

      {orders.length === 0 ? (
        <p className="text-slate-600">Пока нет заказов.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o as any} />
          ))}
        </div>
      )}
    </div>
  );
}
