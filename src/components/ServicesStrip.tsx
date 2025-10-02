"use client";

const services = [
  "Перевезём посылку",
  "Заберём с почты",
  "Трезвый водитель",
  "Выгул питомца",
  "Отвезём договор/акт",
  "Купить и привезти",
  "Проверим на месте",
  "Сфотографируем",
  "Очередь вместо вас",
  "Поможем с переездом",
  "Передадим ключи",
  "Сопроводим ребёнка",
];

export default function ServicesRail() {
  return (
    <div className="select-none">
      <div className="hide-scrollbar flex gap-4 overflow-x-auto px-1 py-2">
        {services.map((s) => (
          <div
            key={s}
            className="min-w-[260px] rounded-2xl border bg-white px-6 py-6 shadow-sm"
          >
            <div className="font-medium">{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
