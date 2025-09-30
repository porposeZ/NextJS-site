export type OrderStatus =
  | "REVIEW"
  | "AWAITING_PAYMENT"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELED";

export function readableStatus(s: OrderStatus): string {
  switch (s) {
    case "REVIEW": return "Принята на рассмотрение";
    case "AWAITING_PAYMENT": return "Ожидает оплаты";
    case "IN_PROGRESS": return "В работе";
    case "DONE": return "Завершена";
    case "CANCELED": return "Отменена";
    default: return s;
  }
}

export default function OrderStatusChangedEmail(props: {
  status: OrderStatus;
  order: { id: string; city: string; description: string; createdAt: Date; dueDate?: Date };
  appUrl: string;
  userName?: string;
  paymentMethod?: "yookassa" | "card";
}) {
  const { status, order, appUrl, userName, paymentMethod } = props;

  let intro: string;
  switch (status) {
    case "REVIEW":
      intro = "Ваша заявка принята и находится на рассмотрении.";
      break;
    case "AWAITING_PAYMENT":
      intro = "Заявка одобрена. Для продолжения требуется оплата.";
      break;
    case "IN_PROGRESS":
      intro = "Мы приступили к выполнению вашей заявки.";
      break;
    case "DONE":
      intro = "Ваша заявка выполнена. Спасибо, что обратились!";
      break;
    case "CANCELED":
      intro = "К сожалению, ваша заявка была отменена.";
      break;
    default:
      intro = "Статус вашей заявки обновлён.";
  }

  const pmText =
    status === "AWAITING_PAYMENT"
      ? paymentMethod === "card"
        ? "Способ оплаты: банковская карта. Мы пришлём ссылку на оплату или счёт."
        : "Способ оплаты: ЮKassa. Мы выставим счёт и отправим его на почту."
      : undefined;

  const ordersLink = `${appUrl}/orders`;

  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <h2>{userName ? `${userName}, ` : ""}статус вашей заявки изменился</h2>
      <p><b>Текущий статус:</b> {readableStatus(status)}</p>
      <p>{intro}</p>
      {pmText && <p>{pmText}</p>}
      <hr />
      <p><b>Город:</b> {order.city}</p>
      {order.dueDate && <p><b>К исполнению:</b> {order.dueDate.toLocaleDateString()}</p>}
      <p><b>Описание:</b><br />{order.description}</p>
      <p><b>ID заявки:</b> {order.id}</p>
      <p>Посмотреть заявку: <a href={ordersLink}>{ordersLink}</a></p>
      <p style={{ color: "#64748b", fontSize: 12 }}>
        Письмо отправлено автоматически, отвечать на него не нужно.
      </p>
    </div>
  );
}
