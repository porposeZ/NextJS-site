"use client";

import { useState, useTransition } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { startPayment } from "./actions/startPayment";

type Order = {
  id: string;
  city: string;
  description: string;
  status: "REVIEW" | "AWAITING_PAYMENT" | "IN_PROGRESS" | "DONE" | "CANCELED";
  createdAt: string | Date;
  dueDate?: string | Date | null;
};

export default function UserOrderCard({ order }: { order: Order }) {
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"yookassa" | "card">("yookassa");
  const [isPending, startTransition] = useTransition();

  function confirmPayment() {
    const fd = new FormData();
    fd.set("orderId", order.id);
    fd.set("paymentMethod", paymentMethod);
    startTransition(async () => {
      await startPayment(fd);
      setShowModal(false);
      // здесь можно добавить тост/уведомление, если используешь
    });
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{order.city}</div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          {order.status}
        </span>
      </div>

      <div className="mt-2 text-sm whitespace-pre-wrap">{order.description}</div>

      <div className="mt-2 text-xs text-slate-500">
        Создано: {new Date(order.createdAt).toLocaleString()}
      </div>

      {order.status === "AWAITING_PAYMENT" && (
        <div className="mt-4">
          <Button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={isPending}
          >
            Оплатить
          </Button>
        </div>
      )}

      {/* Модалка выбора оплаты */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Выберите способ оплаты</h2>
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
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Отмена
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={confirmPayment}
                disabled={isPending}
              >
                Подтвердить
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
