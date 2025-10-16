// src/app/thanks/page.tsx
import Link from "next/link";
import Script from "next/script";
import { env } from "~/server/env";

export const metadata = { title: "Заявка отправлена" };

export default function ThanksPage() {
  const metrikaId = env.METRIKA_ID;
  const metrikaOn = (env.METRIKA_ENABLED ?? "true") !== "false" && !!metrikaId;

  return (
    <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow">
      <h1 className="mb-2 text-2xl font-bold text-sky-700">Спасибо!</h1>

      <p className="text-slate-700">
        Заявка отправлена. В ближайшее время с вами свяжется менеджер для уточнения
        деталей и согласования цены.
      </p>

      <p className="mt-3 text-slate-700">
        Статус заявки можно отслеживать во вкладке{" "}
        <Link href="/orders" className="text-sky-700 underline">
          Мои заказы
        </Link>
        .
      </p>

      <div className="mt-5 flex gap-3">
        <Link
          href="/orders"
          className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Открыть «Мои заказы»
        </Link>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Создать ещё заявку
        </Link>
      </div>

      {/* Goal для рекламных систем */}
      {metrikaOn && (
        <Script
          id="ym-goal-order-sent"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `try { if (window.ym) ym(${metrikaId}, 'reachGoal', 'order_sent'); } catch(e) {}`,
          }}
        />
      )}
    </div>
  );
}
