import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { Card } from "~/components/ui/card";
import { auth } from "~/server/auth"; // ✅

export const metadata = { title: "Мои заказы" };

export default async function OrdersPage() {
  const session = await auth();                       // ✅
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/orders");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Мои заказы</h1>

      {orders.length === 0 ? (
        <p className="text-slate-600">Заказов пока нет.</p>
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

              <div className="mt-2 text-xs text-slate-500">
                Создано: {o.createdAt.toLocaleString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
