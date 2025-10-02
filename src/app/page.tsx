// src/app/page.tsx
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import ServicesStrip from "~/components/ServicesStrip";
import Steps from "~/components/Steps";
import HomeForm from "./HomeForm"; // 👈 клиентская форма в отдельном файле

export const metadata = { title: "Я есть — поручения в любом городе" };

export default async function HomePage() {
  const session = await auth();

  let defaultEmail: string | undefined = session?.user?.email ?? undefined;
  let defaultPhone: string | undefined = undefined;

  if (session?.user?.id) {
    const u = await db.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    });
    defaultPhone = u?.phone ?? undefined;
  }

  return (
    <div className="space-y-12">
      {/* Форма */}
      <section className="mx-auto max-w-4xl">
        <HomeForm defaultEmail={defaultEmail} defaultPhone={defaultPhone} />
      </section>

      {/* Счётчики */}
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-3xl font-extrabold text-sky-700">9 000+</div>
          <div className="mt-1 text-sm text-slate-600">
            исполнителей готовы помочь
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-3xl font-extrabold text-sky-700">18 523</div>
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
            title="Поддержка 24/7"
            text="Мы всегда на связи: отвечаем быстро, помогаем найти решение и даём статус по заказу."
          />
          <InfoCard
            title="Проверенные исполнители"
            text="Каждый помощник проходит отбор: анкета, репутация, реальные задания. Оставляем только надёжных."
          />
          <InfoCard
            title="Гарантия и скорость"
            text="Назначаем менеджера, контролируем сроки и качество. Если что-то идёт не так — подменим исполнителя."
          />
          <InfoCard
            title="Справедливые цены"
            text="Фиксируем стоимость до начала работ и показываем, из чего она состоит. Без скрытых платежей."
          />
        </div>
      </section>

      {/* Как это работает */}
      <section className="space-y-4">
        <h2 className="text-center text-2xl font-extrabold text-sky-700">
          Как это работает
        </h2>
        <div className="mx-auto max-w-5xl">
          <Steps />
        </div>
      </section>

      {/* Полоса услуг */}
      <section className="space-y-4">
        <h2 className="text-center text-2xl font-extrabold text-sky-700">
          Выполняем весь спектр услуг для физических и юридических лиц
          <br />в разных городах России
        </h2>
        <ServicesStrip />
      </section>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="text-base font-semibold">{title}</div>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );
}
