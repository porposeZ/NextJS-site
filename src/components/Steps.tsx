"use client";

type Step = { title: string; text: string };

const STEPS: Step[] = [
  {
    title: "Создайте заказ",
    text: "Опишите задачу, город и желаемую дату исполнения.",
  },
  {
    title: "Мы свяжемся",
    text: "Менеджер уточнит все детали и согласует с вами сроки.",
  },
  { title: "Оплатите", text: "Быстрая и безопасная оплата." },
  {
    title: "Подбор исполнителя",
    text: "Найдем подходящего помощника под ваши запросы.",
  },
  {
    title: "Исполнитель выполнит задачу",
    text: "Проконтролируем сроки и качество исполнения.",
  },
];

const BG_URLS = [
  "/howItWorks/create-1.png",
  "/howItWorks/contact-2.png",
  "/howItWorks/pay-3.png",
  "/howItWorks/search-4.png",
  "/howItWorks/work-5.png",
] as const;

const BG_POSITIONS = [
  "left top",
  "center top",
  "right top",
  "left bottom",
  "right bottom",
] as const;

// безопасный доступ к значениям, чтобы не было string | undefined
function safeBg(i: number) {
  return {
    url: BG_URLS[i] ?? BG_URLS[0],
    pos: BG_POSITIONS[i] ?? "center",
  };
}

export default function Steps() {
  return (
    <section aria-labelledby="howitworks" className="mx-auto max-w-6xl">
      <h2
        id="howitworks"
        className="mb-6 text-center text-2xl font-extrabold text-sky-700"
      >
        Как это работает
      </h2>

      {/* Верхний ряд — 3 карточки */}
      <ol className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-3">
        {STEPS.slice(0, 3).map((s, i) => {
          const { url, pos } = safeBg(i);
          return (
            <StepCard
              key={s.title}
              index={i + 1}
              title={s.title}
              text={s.text}
              bgUrl={url}
              bgPos={pos}
            />
          );
        })}
      </ol>

      {/* Нижний ряд — 2 карточки строго по центру */}
      <ol className="mt-6 flex flex-wrap justify-center gap-18">
        {STEPS.slice(3, 5).map((s, i) => {
          const { url, pos } = safeBg(i + 3);
          return (
            <StepCard
              key={s.title}
              index={i + 4}
              title={s.title}
              text={s.text}
              bgUrl={url}
              bgPos={pos}
            />
          );
        })}
      </ol>
    </section>
  );
}

function StepCard({
  index,
  title,
  text,
  bgUrl,
  bgPos,
}: {
  index: number;
  title: string;
  text: string;
  bgUrl: string;
  bgPos: string;
}) {
  return (
    <li className="relative w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Фон заполняет блок, без зазоров по углам */}
      <div
        aria-hidden
        className="absolute rounded-2xl"
        style={{
          inset: "-1px", // расширяем фон на 1px — исключает белые углы
          backgroundColor: "#EEF7FF",
          backgroundImage: `url(${bgUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "105% 105%", // как вы хотели — пусть рисунок читабелен
          backgroundPosition: bgPos,
        }}
      />

      {/* Номер карточки слева сверху */}
      <div className="absolute top-3 left-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white shadow">
        {index}
      </div>

      {/* Контент */}
      <div className="relative z-10 pt-3 pl-8">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-[15px] leading-snug text-slate-800">
          {text}
        </div>
      </div>
    </li>
  );
}
