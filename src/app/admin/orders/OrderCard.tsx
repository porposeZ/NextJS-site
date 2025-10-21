"use client";

import { useMemo, useState, useTransition } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { updateOrderStatus } from "../actions/updateOrderStatus";
import StatusBadge from "~/components/StatusBadge";

type OrderStatus = "REVIEW" | "AWAITING_PAYMENT" | "IN_PROGRESS" | "DONE" | "CANCELED";

type Order = {
  id: string;
  city: string;
  description: string;
  status: OrderStatus;
  createdAt: string | Date;
  dueDate?: string | Date | null;
  budget?: number | null; // ← текущая назначенная цена, ₽
  user?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  events?: { id: string; message: string; createdAt: string | Date }[];
};

const STATUSES = [
  { v: "REVIEW", label: "REVIEW" },
  { v: "AWAITING_PAYMENT", label: "AWAITING_PAYMENT" },
  { v: "IN_PROGRESS", label: "IN_PROGRESS" },
  { v: "DONE", label: "DONE" },
  { v: "CANCELED", label: "CANCELED" },
] as const;

const fRub = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });

export default function OrderCard({ order }: { order: Order }) {
  const [status, setStatus] = useState<Order["status"]>(order.status);
  const [price, setPrice] = useState<string>(order.budget ? String(order.budget) : "");
  const [isPending, startTransition] = useTransition();

  const showPrice = status === "AWAITING_PAYMENT";

  const budgetText = useMemo(() => {
    if (typeof order.budget === "number" && order.budget > 0) return fRub.format(order.budget);
    return null;
  }, [order.budget]);

  async function submit(nextStatus: Order["status"]) {
    const fd = new FormData();
    fd.set("id", order.id);
    fd.set("status", nextStatus);
    if (showPrice) fd.set("price", price.trim());
    await updateOrderStatus(fd);
  }

  return (
    <Card className="relative p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">{order.city}</div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-2 whitespace-pre-wrap text-sm">{order.description}</div>

      <div className="mt-3 grid gap-1 text-xs text-slate-600">
        <div>
          <b>Пользователь:</b> {order.user?.email ?? "—"}
          {order.user?.name ? ` (${order.user.name})` : ""}
        </div>
        <div>
          <b>Телефон:</b> {order.user?.phone ?? "—"}
        </div>
        <div>
          <b>Создано:</b> {new Date(order.createdAt).toLocaleString()}
        </div>
        {order.dueDate && (
          <div>
            <b>К исполнению:</b> {new Date(order.dueDate).toLocaleDateString()}
          </div>
        )}
        <div>
          <b>ID:</b> {order.id}
        </div>
        {budgetText && (
          <div>
            <b>Назначено ранее:</b> {budgetText}
          </div>
        )}
      </div>

      {order.events && order.events.length > 0 && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <div className="mb-1 font-semibold">История</div>
          <ul className="space-y-1">
            {order.events.map((e) => (
              <li key={e.id}>
                {new Date(e.createdAt).toLocaleString()} — {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Order["status"])}
            className="rounded border px-2 py-1 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s.v} value={s.v}>
                {s.label}
              </option>
            ))}
          </select>

          {showPrice && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className="h-8 w-28 rounded border px-2 text-sm"
                placeholder="Сумма, ₽"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
              />
              <span className="text-xs text-slate-500">₽</span>
            </div>
          )}
        </div>

        <Button
          onClick={() => startTransition(async () => submit(status))}
          size="sm"
          className="bg-orange-500 hover:bg-orange-600"
          disabled={isPending}
        >
          {isPending ? "Сохраняем..." : "Сохранить"}
        </Button>
      </div>

      {showPrice && (
        <p className="mt-2 text-xs text-slate-500">
          Сумма будет показана пользователю в кабинете и подставится в платёжную форму.
        </p>
      )}
    </Card>
  );
}
