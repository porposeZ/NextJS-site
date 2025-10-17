import Link from "next/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";

export const metadata = { title: "Статус оплаты" };

type Props = {
  searchParams: { [k: string]: string | string[] | undefined };
};

export default async function TinkoffResultPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/orders");

  const success = (searchParams.success ?? "0").toString() === "1";
  const canceled = (searchParams.canceled ?? "0").toString() === "1";
  const orderId = (searchParams.orderId ?? "").toString();

  if (!orderId) {
    return (
      <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-2 text-xl font-bold">Не удалось определить заказ</h1>
        <p className="text-slate-700">Попробуйте открыть страницу «Мои заказы».</p>
        <div className="mt-4">
          <Link href="/orders" className="text-sky-600 hover:underline">Перейти к заказам</Link>
        </div>
      </div>
    );
  }

  // проверяем принадлежность
  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    select: { id: true, status: true },
  });

  if (!order) {
    return (
      <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-2 text-xl font-bold">Заказ не найден</h1>
        <div className="mt-4">
          <Link href="/orders" className="text-sky-600 hover:underline">К списку заказов</Link>
        </div>
      </div>
    );
  }

  // Простой сценарий без вебхуков:
  // если success=1 — переводим статус из AWAITING_PAYMENT -> IN_PROGRESS
  if (success && order.status === "AWAITING_PAYMENT") {
    await db.order.update({
      where: { id: order.id },
      data: { status: "IN_PROGRESS" },
    });
  }

  return (
    <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow">
      {success ? (
        <>
          <h1 className="mb-2 text-2xl font-bold text-emerald-600">Оплата принята</h1>
          <p className="text-slate-700">
            Спасибо! Мы начали обработку заказа. Статус можно посмотреть во вкладке «Мои заказы».
          </p>
        </>
      ) : canceled ? (
        <>
          <h1 className="mb-2 text-2xl font-bold text-amber-600">Оплата отменена</h1>
          <p className="text-slate-700">
            Вы отменили платёж. Если передумаете — вернитесь к заказу и повторите оплату.
          </p>
        </>
      ) : (
        <>
          <h1 className="mb-2 text-2xl font-bold text-rose-600">Оплата не удалась</h1>
          <p className="text-slate-700">
            Платёж не прошёл. Попробуйте снова или свяжитесь с нами — поможем.
          </p>
        </>
      )}

      <div className="mt-4">
        <Link href="/orders" className="text-sky-600 hover:underline">Открыть «Мои заказы»</Link>
      </div>
    </div>
  );
}
