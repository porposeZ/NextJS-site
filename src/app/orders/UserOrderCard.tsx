"use client";

import { useTransition, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { startPayment, type StartPaymentResult } from "./actions/startPayment";

type OrderStatus = "REVIEW" | "AWAITING_PAYMENT" | "IN_PROGRESS" | "DONE" | "CANCELED";

type Order = {
  id: string;
  city: string;
  description: string;
  status: OrderStatus;
  createdAt: string | Date;
  budget?: number | null;
};

const STATUS_RU: Record<OrderStatus, string> = {
  REVIEW: "На проверке",
  AWAITING_PAYMENT: "Ждёт оплаты",
  IN_PROGRESS: "В работе",
  DONE: "Выполнено",
  CANCELED: "Отменено",
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  REVIEW: "bg-sky-100 text-sky-700",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700",
  DONE: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-rose-100 text-rose-700",
};

const fRub = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export default function UserOrderCard({ order }: { order: Order }) {
  const [isPending, start] = useTransition();

  const amountRub: number | null = useMemo(() => {
    return typeof order.budget === "number" && order.budget > 0 ? order.budget : null;
  }, [order.budget]);

  const pay = () => {
    const guardKey = `paymentGuard:${order.id}`;
    const now = Date.now();
    const last = Number(localStorage.getItem(guardKey) || "0");
    if (now - last < 10_000) {
      alert("Подождите несколько секунд перед повторной попыткой.");
      return;
    }
    localStorage.setItem(guardKey, String(now));

    start(async () => {
      try {
        const fd = new FormData();
        fd.set("orderId", order.id);
        fd.set("paymentMethod", "yookassa");

        const res = (await startPayment(fd)) as StartPaymentResult;

        if (!res.ok) {
          alert(res.error || "Не удалось инициировать оплату");
          return;
        }

        window.location.href = res.paymentUrl;
      } catch (err) {
        console.error("[pay] unexpected error:", err);
        alert("Произошла ошибка при запуске оплаты.");
      }
    });
  };

  const createdAt = typeof order.createdAt === "string" ? new Date(order.createdAt) : order.createdAt;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-lg font-semibold">{order.city}</div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[order.status]}`}
          title={order.status}
        >
          {STATUS_RU[order.status]}
          <span className="opacity-60">({order.status})</span>
        </span>
      </div>

      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{order.description}</div>

      <div className="mt-3 text-xs text-slate-500">Создано: {createdAt.toLocaleString()}</div>

      {order.status === "AWAITING_PAYMENT" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-700">
            {amountRub ? (
              <>
                К оплате: <span className="font-medium text-slate-900">{fRub.format(amountRub)}</span>
              </>
            ) : (
              <span className="text-slate-500">Сумма появится после согласования</span>
            )}
          </div>

          <Button onClick={pay} disabled={isPending} aria-busy={isPending} className="bg-orange-500 hover:bg-orange-600">
            {isPending ? "Переходим к оплате..." : "Оплатить"}
          </Button>
        </div>
      )}
    </div>
  );
}
