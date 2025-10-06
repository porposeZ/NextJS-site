// src/app/page.tsx
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import ServicesStrip from "~/components/ServicesStrip";
import Steps from "~/components/Steps";
import HomeForm from "./HomeForm";

export const metadata = { title: "Я есть — поручения в любом городе" };

export default async function HomePage() {
  const session = await auth();

  let defaults = {
    email: session?.user?.email ?? "",
    phone: "",
    name: "",
    city: "",
    organization: "",
    personType: "individual" as "individual" | "company",
  };

  if (session?.user?.id) {
    const u = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        phone: true,
        name: true,
        defaultCity: true,
        organization: true,
      },
    });

    defaults = {
      email: session.user.email ?? "",
      phone: u?.phone ?? "",
      name: u?.name ?? "",
      city: u?.defaultCity ?? "",
      organization: u?.organization ?? "",
      personType: u?.organization ? "company" : "individual",
    };
  }

  return (
    <div className="space-y-12">
      {/* Заголовок страницы */}
      <section className="mx-auto max-w-6xl px-2">
        <h1 className="text-center text-3xl font-extrabold text-sky-700">
          Свой человек в каждом городе
        </h1>
      </section>

      {/* Форма */}
      <section className="mx-auto max-w-4xl">
        <HomeForm
          defaultEmail={defaults.email}
          defaultPhone={defaults.phone}
          defaultName={defaults.name}
          defaultCity={defaults.city}
          defaultOrganization={defaults.organization}
          defaultPersonType={defaults.personType}
        />
      </section>

      {/* Счётчики */}
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-center gap-3">
            <CheckIcon />
            <div className="text-3xl font-extrabold text-sky-700">9 000+</div>
          </div>
          <div className="mt-1 text-sm text-slate-600">
            исполнителей готовы помочь
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-center gap-3">
            <CheckIcon />
            <div className="text-3xl font-extrabold text-sky-700">18 523</div>
          </div>
          <div className="mt-1 text-sm text-slate-600">выполненных заказа</div>
        </div>
      </section>

      {/* 4 инфо-блока */}
      <section className="space-y-4">
        <h2 className="text-center text-2xl font-extrabold text-sky-700">
          Почему с нами удобно
        </h2>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            bgIndex={1}
            title="Поддержка 24/7"
            text="Мы всегда на связи: отвечаем быстро, помогаем найти решение и даём статус по заказу."
          />
          <InfoCard
            bgIndex={2}
            title="Проверенные исполнители"
            text="Каждый помощник проходит отбор: анкета, репутация, реальные задания. Оставляем только надёжных."
          />
          <InfoCard
            bgIndex={2}
            title="Гарантия и скорость"
            text="Назначаем менеджера, контролируем сроки и качество. Если что-то идёт не так — подменим исполнителя."
          />
          <InfoCard
            bgIndex={1}
            title="Справедливые цены"
            text="Фиксируем стоимость до начала работ и показываем, из чего она состоит. Без скрытых платежей."
          />
        </div>
      </section>

      {/* Как это работает */}
      <section className="space-y-4">
        <div className="mx-auto max-w-5xl">
          <Steps />
        </div>
      </section>

      {/* Полоса услуг */}
      <section className="space-y-4">
        <h2 className="text-center text-2xl font-extrabолd text-sky-700">
          Выполняем полный спектр услуг для физических и юридических лиц
          <br />
          в разных городах России
        </h2>
        <ServicesStrip />
      </section>
    </div>
  );
}

function InfoCard({
  title,
  text,
  bgIndex,
}: {
  title: string;
  text: string;
  bgIndex: number;
}) {
  const bgUrl = `/InfoCard/info-${bgIndex}.png`;
  const positions = ["left top", "right top", "left bottom", "right bottom"] as const;
  const pos = positions[(bgIndex - 1) % positions.length];

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 shadow-sm ring-1 ring-slate-200"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "105% 105%",
        backgroundPosition: pos,
      }}
    >
      <div className="text-base font-semibold">{title}</div>
      <p className="mt-2 text-sm text-slate-700">{text}</p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="10" className="fill-emerald-500/15" />
      <path
        d="M7 12.5l3.2 3L17 8.5"
        className="stroke-emerald-600"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
