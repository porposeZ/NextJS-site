import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Card } from "~/components/ui/card";
import UserOrderCard from "./UserOrderCard"; // <— default импорт

export const metadata = { title: "Мои заказы" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/orders");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Мои заказы</h1>

      {orders.length === 0 ? (
        <Card className="p-4 text-slate-600">Заказов пока нет.</Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <UserOrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
