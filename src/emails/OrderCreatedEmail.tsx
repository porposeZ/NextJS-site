export default function OrderCreatedEmail(props: {
  order: { id: string; city: string; description: string; createdAt: Date; dueDate?: Date };
  appUrl: string;
  userName?: string;
}) {
  const { order, appUrl, userName } = props;
  const ordersLink = `${appUrl}/orders`;

  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <h2>{userName ? `${userName}, ` : ""}ваша заявка получена</h2>
      <p>Мы приняли заявку и начали её рассматривать. Статус можно проверять в личном кабинете.</p>
      <hr />
      <p><b>Город:</b> {order.city}</p>
      {order.dueDate && <p><b>К исполнению:</b> {order.dueDate.toLocaleDateString()}</p>}
      <p><b>Описание:</b><br />{order.description}</p>
      <p><b>ID заявки:</b> {order.id}</p>
      <p>
        Перейти к заявкам: <a href={ordersLink}>{ordersLink}</a>
      </p>
      <p style={{ color: "#64748b", fontSize: 12 }}>
        Письмо отправлено автоматически, отвечать на него не нужно.
      </p>
    </div>
  );
}
