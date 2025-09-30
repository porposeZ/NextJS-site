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
};

const STATUSES = [
  { v: "REVIEW", label: "REVIEW" },
  { v: "AWAITING_PAYMENT", label: "AWAITING_PAYMENT" },
  { v: "IN_PROGRESS", label: "IN_PROGRESS" },
  { v: "DONE", label: "DONE" },
  { v: "CANCELED", label: "CANCELED" },
] as const;

export default function OrderCard({ order }: { order: Order }) {
  const [status, setStatus] = useState<Order["status"]>(order.status);
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"yookassa" | "card">("yookassa");
  const [isPending, startTransition] = useTransition();

  async function submit(nextStatus: Order["status"], pm?: "yookassa" | "card") {
    const fd = new FormData();
    fd.set("id", order.id);
    fd.set("status", nextStatus);
    if (pm) fd.set("paymentMethod", pm);
    await updateOrderStatus(fd);
  }

  function onSave() {
    if (status === "AWAITING_PAYMENT") {
      setShowModal(true);
      return;
    }
    startTransition(async () => submit(status));
  }

  function confirmPayment() {
    setShowModal(false);
    startTransition(async () => submit("AWAITING_PAYMENT", paymentMethod));
  }

  return (
    <Card className="p-4 relative">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{order.city}</div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          {order.status}
        </span>
      </div>

      <div className="mt-2 text-sm whitespace-pre-wrap">{order.description}</div>

      <div className="mt-3 grid gap-1 text-xs text-slate-600">
        <div><b>Пользователь:</b> {order.user?.email ?? "—"}{order.user?.name ? ` (${order.user.name})` : ""}</div>
        <div><b>Телефон:</b> {order.user?.phone ?? "—"}</div>
        <div><b>Создано:</b> {new Date(order.createdAt).toLocaleString()}</div>
        {order.dueDate && <div><b>К исполнению:</b> {new Date(order.dueDate).toLocaleDateString()}</div>}
        <div><b>ID:</b> {order.id}</div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Order["status"])}
          className="rounded border px-2 py-1 text-sm"
        >
          {STATUSES.map(s => (
            <option key={s.v} value={s.v}>{s.label}</option>
          ))}
        </select>
        <Button onClick={onSave} size="sm" className="bg-orange-500 hover:bg-orange-600" disabled={isPending}>
          {isPending ? "Сохраняем..." : "Сохранить"}
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Выберите способ оплаты</h2>
            <p className="mt-1 text-sm text-slate-600">
              Статус будет изменён на <b>AWAITING_PAYMENT</b>, а пользователю уйдёт письмо с инструкцией.
            </p>

            <div className="mt-4 grid gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pm"
                  value="yookassa"
                  checked={paymentMethod === "yookassa"}
                  onChange={() => setPaymentMethod("yookassa")}
                />
                ЮKassa (выставим счёт)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pm"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                Банковская карта
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={confirmPayment}>
                Подтвердить
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
