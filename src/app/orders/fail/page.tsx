import Link from "next/link";
import Script from "next/script";
import { env } from "~/server/env";

export const metadata = { title: "Оплата не выполнена" };

export default function FailPage() {
  const metrikaId = env.METRIKA_ID;
  const metrikaOn = (env.METRIKA_ENABLED ?? "true") !== "false" && !!metrikaId;

  return (
    <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow">
      <h1 className="mb-2 text-2xl font-bold text-rose-600">Оплата не завершена</h1>
      <p className="text-slate-700">
        Похоже, оплата не прошла или была отменена. Попробуйте снова со страницы{" "}
        <Link href="/orders" className="text-sky-600 underline">
          Мои заказы
        </Link>.
      </p>

      {metrikaOn && (
        <Script
          id="ym-goal-payment-fail"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `try { if (window.ym) ym(${metrikaId}, 'reachGoal', 'payment_fail'); } catch(e) {}`,
          }}
        />
      )}
    </div>
  );
}
