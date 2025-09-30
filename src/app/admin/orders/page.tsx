import { db } from "~/server/db";
import { requireAdmin } from "~/server/auth/roles";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { updateOrderStatus } from "../actions/updateOrderStatus";

export const metadata = { title: "Все заказы — Админ" };

const STATUSES = [
  { v: "REVIEW", label: "REVIEW" },
  { v: "AWAITING_PAYMENT", label: "AWAITING_PAYMENT" },
  { v: "IN_PROGRESS", label: "IN_PROGRESS" },
  { v: "DONE", label: "DONE" },
  { v: "CANCELED", label: "CANCELED" },
] as const;

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
            <Card key={o.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{o.city}</div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                  {o.status}
                </span>
              </div>

              <div className="mt-2 text-sm whitespace-pre-wrap">{o.description}</div>

              <div className="mt-3 grid gap-1 text-xs text-slate-600">
                <div><b>Пользователь:</b> {o.user?.email ?? "—"}{o.user?.name ? ` (${o.user.name})` : ""}</div>
                <div><b>Телефон:</b> {o.user?.phone ?? "—"}</div>
                <div><b>Создано:</b> {o.createdAt.toLocaleString()}</div>
                {o.dueDate && <div><b>К исполнению:</b> {o.dueDate.toLocaleDateString()}</div>}
                {typeof o.budget === "number" && <div><b>Бюджет:</b> {o.budget} ₽</div>}
                <div><b>ID:</b> {o.id}</div>
              </div>

              <form action={updateOrderStatus} className="mt-4 flex items-center gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select
                  name="status"
                  defaultValue={o.status}
                  className="rounded border px-2 py-1 text-sm"
                >
                  {STATUSES.map(s => (
                    <option key={s.v} value={s.v}>{s.label}</option>
                  ))}
                </select>
                <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600">
                  Сохранить
                </Button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
