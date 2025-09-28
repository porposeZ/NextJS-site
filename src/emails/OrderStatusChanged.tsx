import * as React from "react";

export default function OrderStatusChanged(props: {
  userName?: string | null;
  orderId: string;
  oldStatus: string;
  newStatus: string;
}) {
  const { userName, orderId, oldStatus, newStatus } = props;
  return (
    <div style={{fontFamily:"Inter, Arial, sans-serif"}}>
      <h2>Статус заказа изменён</h2>
      <p>Здравствуйте{userName ? `, ${userName}` : ""}!</p>
      <p>Статус заказа <b>{orderId}</b> изменён с <b>{oldStatus}</b> на <b>{newStatus}</b>.</p>
    </div>
  );
}
