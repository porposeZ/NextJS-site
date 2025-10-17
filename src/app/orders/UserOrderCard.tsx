// src/app/orders/UserOrderCard.tsx
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
  budget?: number | null; // <— показываем цену, которую админ назначил
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
    start(async () => {
      try {
        const fd = new FormData();
        fd.set("orderId", order.id);
        // пока один метод — помечаем внутренним маркером
        fd.set("paymentMethod", "yookassa");

        const res = (await startPayment(fd)) as StartPaymentResult;

        if (!res.ok) {
          console.warn("[startPayment] failed:", res.error);
          alert("Не удалось инициировать оплату. Попробуйте позже.");
          return;
        }

        // Перенаправление на платёжную страницу
        window.location.href = res.paymentUrl;
      } catch (e) {
        console.error("[pay] unexpected error:", e);
        alert("Произошла ошибка при запуске оплаты.");
      }
    });
  };

  const createdAt = typeof order.createdAt === "string" ? new Date(order.createdAt) : order.createdAt;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Заголовок с городом и статусом */}
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

      {/* Описание */}
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{order.description}</div>

      {/* Дата */}
      <div className="mt-3 text-xs text-slate-500">Создано: {createdAt.toLocaleString()}</div>

      {/* Контакты по заявке + кнопка оплаты */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="mr-1">Связаться по заявке:</span>

          {/* WhatsApp */}
          <a
            href="https://wa.me/message/35FOTDGQOVZ4O1"
            aria-label="WhatsApp"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-600"
            title="Написать в WhatsApp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 3.5A10.5 10.5 0 0 0 3.6 19.2L3 22l2.9-.6A10.5 10.5 0 1 0 20 3.5ZM12 20.5a8.5 8.5 0 1 1 7.1-13.1 8.5 8.5 0 0 1-7.1 13.1Zm4-6.3c-.2-.1-1.2-.6-1.4-.7s-.3-.1-.5.1-.6.7-.7.8-.3.1-.5 0a6.7 6.7 0 0 1-2-1.3 7.4 7.4 0 0 1-1.4-1.8c-.1-.2 0-.3 0-.5l.3-.4.2-.4c.1-.1 0-.3 0-.4l-.6-1.4c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.2-.5.4a2 2 0 0 0-.6 1.6 4 4 0 0 0 .8 2.1 9.7 9.7 0 0 0 3.7 3.6c.4.2 1 .5 1.6.6a3 3 0 0 0 1.4.1 2.2 2.2 0 0 0 1.4-1c.2-.4.2-.8.2-.9 0-.1-.2-.2-.4-.3Z" />
            </svg>
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/yayestMG"
            aria-label="Telegram"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-600"
            title="Написать в Telegram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.5 14.1 9.3 18c.4 0 .6-.2.8-.4l1.9-1.8 4 3c.7.4 1.2.2 1.4-.7l2.5-11c.3-1.2-.4-1.7-1.2-1.4L3.7 9c-1 .4-1 1 .2 1.4л4.5 1.4 10.4-6.6-9.3 8.9Z" />
            </svg>
          </a>
        </div>

        {order.status === "AWAITING_PAYMENT" && (
          <div className="flex items-center gap-3">
            {amountRub && (
              <span className="text-sm font-medium text-slate-700">
                К оплате: <span className="text-slate-900">{fRub.format(amountRub)}</span>
              </span>
            )}
            <Button
              onClick={pay}
              disabled={isPending}
              aria-busy={isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isPending ? "Переходим к оплате..." : "Оплатить"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
