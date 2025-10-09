export default function NewOrderEmail(props: {
  order: {
    id: string;
    city: string;
    description: string;
    createdAt: Date;
    dueDate?: Date;
  };
  user: { email: string; name?: string; phone?: string };
  adminLink: string;
}) {
  const { order, user, adminLink } = props;
  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <h2>Новая заявка</h2>
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
      <hr />
      <p>
        <b>Пользователь:</b> {user.email}
        {user.name ? ` (${user.name})` : ""}
      </p>
      {user.phone && (
        <p>
          <b>Телефон:</b> {user.phone}
        </p>
      )}
      <p>
        <b>Создано:</b> {order.createdAt.toLocaleString()}
      </p>
      <p>
        <b>ID заявки:</b> {order.id}
      </p>
      <p>
        Открыть админку: <a href={adminLink}>{adminLink}</a>
      </p>
    </div>
  );
}
