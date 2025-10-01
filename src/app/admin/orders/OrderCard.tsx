"use client";

import { useState, useTransition } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { updateOrderStatus } from "../actions/updateOrderStatus";

type Order = {
  id: string;
  city: string;
  description: string;
  status: "REVIEW" | "AWAITING_PAYMENT" | "IN_PROGRESS" | "DONE" | "CANCELED";
  createdAt: string | Date;
  dueDate?: string | Date | null;
  user?: { email?: string | null; name?: string | null; phone?: string | null } | null;
  events?: { id: string; message: string; createdAt: Date }[];
};

const STATUSES = [
  { v: "REVIEW", label: "Проверка" },
  { v: "AWAITING_PAYMENT", label: "Ожидает оплаты" },
  { v: "IN_PROGRESS", label: "В работе" },
  { v: "DONE", label: "Выполнено" },
  { v: "CANCELED", label: "Отменено" },
] as const;

function ruStatus(code: Order["status"]) {
  const m = STATUSES.find((s) => s.v === code);
  return m ? m.label : code;
}

export default function OrderCard({ order }: { order: Order }) {
  const [status, setStatus] = useState<Order["status"]>(order.status);
  const [isPending, startTransition] = useTransition();

  async function submit(nextStatus: Order["status"]) {
    const fd = new FormData();
    fd.set("id", order.id);
    fd.set("status", nextStatus);
    await updateOrderStatus(fd); // у админа просто сохраняем, БЕЗ модалки
  }

  return (
    <Card className="p-4 relative">
      <div className="flex items-start justify-between">
        <div className="font-semibold">{order.city}</div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold leading-tight text-sky-700 text-right">
          {ruStatus(order.status)}
          <span className="block text-[10px] uppercase opacity-70">{order.status}</span>
        </span>
      </div>

      <div className="mt-2 text-sm whitespace-pre-wrap">{order.description}</div>

      <div className="mt-3 grid gap-1 text-xs text-slate-600">
        <div>
          <b>Пользователь:</b> {order.user?.email ?? "—"}
          {order.user?.name ? ` (${order.user.name})` : ""}
        </div>
        <div><b>Телефон:</b> {order.user?.phone ?? "—"}</div>
        <div><b>Создано:</b> {new Date(order.createdAt).toLocaleString()}</div>
        {order.dueDate && <div><b>К исполнению:</b> {new Date(order.dueDate).toLocaleDateString()}</div>}
        <div><b>ID:</b> {order.id}</div>
      </div>

      {/* История показываем в админке */}
      {order.events && order.events.length > 0 && (
        <div className="mt-4 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          <div className="mb-1 font-medium text-slate-700">История</div>
          {order.events.map((e) => (
            <div key={e.id}>
              {new Date(e.createdAt).toLocaleString()} — {e.message}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Order["status"])}
          className="rounded border px-2 py-1 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s.v} value={s.v}>
              {s.label} — {s.v}
            </option>
          ))}
        </select>
        <Button
          onClick={() => startTransition(async () => submit(status))}
          size="sm"
          className="bg-orange-500 hover:bg-orange-600"
          disabled={isPending}
        >
          {isPending ? "Сохраняем..." : "Сохранить"}
        </Button>
      </div>
    </Card>
  );
}
