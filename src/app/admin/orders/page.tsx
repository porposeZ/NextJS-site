import { redirect } from "next/navigation";
import { getSession } from "~/server/auth/getSession";
import { env } from "~/server/env";
import { db } from "~/server/db";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { updateOrderStatus } from "./actions";
import { OrderStatus } from "@prisma/client";

export const metadata = { title: "Админ · Заказы" };

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session?.user?.email || session.user.email !== env.ADMIN_EMAIL) {
    redirect("/auth/signin?callbackUrl=/admin/orders");
  }

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Заказы</h1>

      <div className="grid gap-4">
        {orders.map((o) => (
          <Card key={o.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{o.city}</div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                {o.status}
              </span>
            </div>
            <div className="text-sm text-slate-600">
              Пользователь: {o.user?.email ?? "—"}
            </div>
            <div className="text-sm whitespace-pre-wrap">{o.description}</div>

            <form
              action={async (fd) => {
                "use server";
                const next = fd.get("status") as OrderStatus;
                await updateOrderStatus(o.id, next);
              }}
              className="flex items-center gap-3 pt-2"
            >
              <select
                name="status"
                defaultValue={o.status}
                className="rounded border px-2 py-1 text-sm"
              >
                {Object.values(OrderStatus).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Button type="submit" size="sm">Обновить</Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
