export default function PaymentMethodChosenEmail(props: {
  order: {
    id: string;
    city: string;
    description: string;
    createdAt: Date;
    dueDate?: Date;
  };
  userEmail: string;
  method: "yookassa" | "card";
  adminLink: string;
}) {
  const { order, userEmail, method, adminLink } = props;
  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <h2>Выбран способ оплаты</h2>
      <p>
        Пользователь <b>{userEmail}</b> выбрал способ оплаты:{" "}
        <b>{method === "card" ? "Банковская карта" : "ЮKassa"}</b>.
      </p>
      <hr />
      <p>
        <b>ID заявки:</b> {order.id}
      </p>
      <p>
        <b>Город:</b> {order.city}
      </p>
      {order.dueDate && (
        <p>
          <b>К исполнению:</b> {order.dueDate.toLocaleDateString()}
        </p>
      )}
      <p>
        <b>Описание:</b>
        <br />
        {order.description}
      </p>
      <p>
        Открыть админку: <a href={adminLink}>{adminLink}</a>
      </p>
    </div>
  );
}
