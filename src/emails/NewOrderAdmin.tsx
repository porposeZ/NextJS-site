import * as React from "react";

export default function NewOrderAdmin(props: {
  userEmail?: string | null;
  userName?: string | null;
  city: string;
  description: string;
}) {
  const { userEmail, userName, city, description } = props;
  return (
    <div style={{fontFamily:"Inter, Arial, sans-serif"}}>
      <h2>Новая заявка</h2>
      <p><b>Пользователь:</b> {userName || "—"} ({userEmail || "—"})</p>
      <p><b>Город:</b> {city}</p>
      <p><b>Описание:</b></p>
      <pre style={{whiteSpace:"pre-wrap"}}>{description}</pre>
    </div>
  );
}
