// src/app/orders/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import UserOrderCard from "./UserOrderCard";
import { withDbRetry } from "~/server/utils/dbRetry";

export const metadata = { title: "Мои заказы" };

// всегда получать свежие данные, без кэша
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/orders");
  const userId = session.user.id;

  // Грузим заказы пользователя с ретраем при обрыве соединения
  let orders:
    | {
        id: string;
        city: string;
        description: string | null;
        createdAt: Date;
        status: "REVIEW" | "AWAITING_PAYMENT" | "IN_PROGRESS" | "DONE" | "CANCELED";
        budget: number | null;
      }[]
    | null = null;

  try {
    orders = await withDbRetry(() =>
      db.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100, // ограничим пачку — стабильнее при слабом интернете
        select: {
          id: true,
          city: true,
          description: true,
          createdAt: true,
          status: true,
          budget: true,
        },
      })
    );
  } catch (e) {
    console.error("[orders] load error:", e);
    orders = null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Мои заказы</h1>

      {!orders ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Временно нет связи с базой. Проверьте интернет и{" "}
          <a href="/orders" className="underline">
            обновите страницу
          </a>
          .
        </div>
      ) : orders.length === 0 ? (
        <p className="text-slate-600">Пока заявок нет.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <UserOrderCard
              key={o.id}
              order={{
                id: o.id,
                city: o.city,
                description: o.description ?? "",
                createdAt: o.createdAt,
                status: o.status,
                budget: o.budget ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
