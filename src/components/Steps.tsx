"use client";

type Step = { title: string; text: string };

const STEPS: Step[] = [
  {
    title: "Создайте заказ",
    text: "Опишите задачу, город и желаемую дату исполнения.",
  },
  {
    title: "Мы свяжемся",
    text: "Менеджер уточнит детали и подберёт подходящего исполнителя.",
  },
  {
    title: "Оплатите удобным способом",
    text: "ЮKassa или банковская карта — быстро и безопасно.",
  },
  {
    title: "Исполнитель выполнит задачу",
    text: "Мы контролируем сроки и качество выполнения поручения.",
  },
];

export default function Steps() {
  return (
    <section aria-labelledby="howitworks" className="mx-auto max-w-5xl">
      <h2 id="howitworks" className="mb-6 text-center text-2xl font-extrabold text-sky-700">
        Как это работает
      </h2>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
              {i + 1}
            </div>
            <div className="text-base font-semibold">{s.title}</div>
            <div className="mt-1 text-sm text-slate-600">{s.text}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
