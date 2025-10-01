"use client";

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useState, useTransition } from "react";
import { startPayment } from "./actions/startPayment";

type Order = {
  id: string;
  city: string;
  description: string;
  status: "REVIEW" | "AWAITING_PAYMENT" | "IN_PROGRESS" | "DONE" | "CANCELED";
  createdAt: string | Date;
  dueDate?: string | Date | null;
};

const RU_STATUS: Record<Order["status"], string> = {
  REVIEW: "Проверка",
  AWAITING_PAYMENT: "Ожидает оплаты",
  IN_PROGRESS: "В работе",
  DONE: "Выполнено",
  CANCELED: "Отменено",
};

export default function UserOrderCard({ order }: { order: Order }) {
  const [isPending, start] = useTransition();
  const [modal, setModal] = useState(false);
  const [method, setMethod] = useState<"yookassa" | "card">("yookassa");

  const confirm = () =>
    start(async () => {
      const fd = new FormData();
      fd.set("orderId", order.id);
      fd.set("paymentMethod", method);
      await startPayment(fd);
      setModal(false);
    });

  return (
    <Card className="p-4 relative">
      <div className="flex items-start justify-between">
        <div className="font-semibold">{order.city}</div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold leading-tight text-sky-700 text-right">
          {RU_STATUS[order.status]}
          <span className="block text-[10px] uppercase opacity-70">{order.status}</span>
        </span>
      </div>

      <div className="mt-2 text-sm whitespace-pre-wrap">{order.description}</div>

      <div className="mt-3 grid gap-1 text-xs text-slate-600">
        <div><b>Создано:</b> {new Date(order.createdAt).toLocaleString()}</div>
        {order.dueDate && <div><b>К исполнению:</b> {new Date(order.dueDate).toLocaleDateString()}</div>}
        <div><b>ID:</b> {order.id}</div>
      </div>

      {order.status === "AWAITING_PAYMENT" && (
        <div className="mt-4">
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            disabled={isPending}
            onClick={() => setModal(true)}
          >
            Оплатить
          </Button>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Выберите способ оплаты</h2>
            <div className="mt-4 grid gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pm"
                  value="yookassa"
                  checked={method === "yookassa"}
                  onChange={() => setMethod("yookassa")}
                />
                ЮKassa
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pm"
                  value="card"
                  checked={method === "card"}
                  onChange={() => setMethod("card")}
                />
                Банковская карта
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Отмена</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={confirm} disabled={isPending}>
                {isPending ? "Открываем оплату..." : "Продолжить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
