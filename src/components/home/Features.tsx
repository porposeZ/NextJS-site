const FEATURES = [
  {
    title: "Поддержка 24/7",
    text: "Мы на связи в любой день и час. Отвечаем быстро и ведём вас до полного результата.",
  },
  {
    title: "Проверенные исполнители",
    text: "Каждый исполнитель проходит ручную модерацию, рейтинг и повторные проверки.",
  },
  {
    title: "Гарантия и скорость",
    text: "Согласуем сроки ещё до оплаты и контролируем ход работы на всех этапах.",
  },
  {
    title: "Справедливые цены",
    text: "Прозрачные сметы, без скрытых платежей. Оплачиваете только согласованный объём.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto mt-10 max-w-6xl">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="text-base font-semibold">{f.title}</div>
            <div className="mt-1 text-sm text-slate-600">{f.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
