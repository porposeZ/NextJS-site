import * as React from "react";

export default function OrderReceivedUser(props: {
  userName?: string | null;
  city: string;
  description: string;
}) {
  const { userName, city, description } = props;
  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <h2>Заявка принята</h2>
      <p>Здравствуйте{userName ? `, ${userName}` : ""}!</p>
      <p>Мы получили вашу заявку.</p>
      <ul>
        <li>
          <b>Город:</b> {city}
        </li>
        <li>
          <b>Описание:</b> {description}
        </li>
      </ul>
      <p>Мы свяжемся с вами как можно скорее.</p>
    </div>
  );
}
