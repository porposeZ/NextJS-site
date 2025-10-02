"use client";

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import StatusBadge from "~/components/StatusBadge";
import { startPayment } from "./actions/startPayment";

type Order = {
  id: string;
  city: string;
  description: string;
  status: "REVIEW" | "AWAITING_PAYMENT" | "IN_PROGRESS" | "DONE" | "CANCELED";
  createdAt: string | Date;
  dueDate?: string | Date | null;
  events?: { id: string; message: string; createdAt: string | Date }[];
};

export default function UserOrderCard({ order }: { order: Order }) {
  const canPay = order.status === "AWAITING_PAYMENT";

  async function pay(method: "yookassa" | "card") {
    const fd = new FormData();
    fd.set("orderId", order.id);
    fd.set("paymentMethod", method);
    await startPayment(fd);
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">{order.city}</div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-2 whitespace-pre-wrap text-sm">{order.description}</div>

      <div className="mt-2 text-xs text-slate-500">
        Создано: {new Date(order.createdAt).toLocaleString()}
      </div>

      {order.events && order.events.length > 0 && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
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

      {canPay && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => pay("yookassa")}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Оплатить
          </Button>
          <Button variant="secondary" onClick={() => pay("card")}>
            Банковская карта
          </Button>
        </div>
      )}
    </Card>
  );
}
