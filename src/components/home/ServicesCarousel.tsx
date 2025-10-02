"use client";

const SERVICES = [
  "Доставим",
  "Проверим",
  "Проконтролируем",
  "Сфотографируем",
  "Закупим",
  "Подадим документы",
  "Встреча/передача в аэропорту",
  "Мелкий бытовой ремонт",
  "Срочные покупки",
  "Перевезём посылку",
  "Заберём с почты",
  "Трезвый водитель",
  "Выгул питомца",
  "Отвезём договор/акт",
];

export default function ServicesCarousel() {
  return (
    <section aria-labelledby="services" className="mx-auto mt-10 max-w-6xl">
      <h2 id="services" className="mb-4 text-center text-2xl font-extrabold text-sky-700">
        Выполняем весь спектр услуг для физических и юридических лиц
        <br className="hidden sm:block" /> в разных городах России
      </h2>

      <div className="relative">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
          {SERVICES.map((name) => (
            <div
              key={name}
              className="min-w-[220px] snap-start rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
            >
              <div className="text-sm font-medium">{name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
