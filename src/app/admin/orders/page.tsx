import { requireAdmin } from "~/server/auth/roles";
import { db } from "~/server/db";
import OrderCard from "./OrderCard";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const metadata = { title: "Все заказы — Админ" };

const STATUSES = ["REVIEW","AWAITING_PAYMENT","IN_PROGRESS","DONE","CANCELED"] as const;

type Search = { q?: string; status?: string; from?: string; to?: string };

function norm(str: string | null | undefined) {
  return (str ?? "").toLocaleLowerCase("ru-RU");
}
function onlyDigits(s: string | null | undefined) {
  return (s ?? "").replace(/\D/g, "");
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireAdmin();

  const { q, status, from, to } = await searchParams;
  const qVal = (q ?? "").trim();
  const statusVal = status ?? "";
  const fromVal = from ?? "";
  const toVal = to ?? "";

  // Базовый where (без строки поиска)
  const where: any = {};
  if (statusVal) where.status = statusVal;
  if (fromVal || toVal) {
    where.createdAt = {};
    if (fromVal) where.createdAt.gte = new Date(`${fromVal}T00:00:00.000Z`);
    if (toVal) where.createdAt.lte = new Date(`${toVal}T23:59:59.999Z`);
  }

  // Берем кандидатов одним запросом (с учетом статуса/дат) и фильтруем в памяти,
  // чтобы корректно обрабатывать кириллицу (toLocaleLowerCase).
  const candidates = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true, phone: true } },
      events: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  const needle = qVal.toLocaleLowerCase("ru-RU");
  const needleDigits = onlyDigits(qVal);

  const orders = qVal
    ? candidates.filter((o) => {
        const hay = [
          norm(o.city),
          norm(o.description),
          norm(o.user?.email),
          norm(o.user?.name),
        ];
        const byText = hay.some((h) => h.includes(needle));

        const phoneDigits = onlyDigits(o.user?.phone);
        const byPhone =
          needleDigits.length > 0 && phoneDigits.includes(needleDigits);

        return byText || byPhone;
      })
    : candidates;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Все заказы</h1>

      {/* Фильтр */}
      <form method="get" className="grid grid-cols-1 gap-3 md:grid-cols-5 items-end">
        <div className="md:col-span-2">
          <Label>Поиск</Label>
          <Input
            name="q"
            defaultValue={qVal}
            placeholder="Город, описание, email, имя или телефон"
          />
        </div>

        <div>
          <Label>Статус</Label>
          <select
            name="status"
            defaultValue={statusVal}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Любой</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>С даты</Label>
          <Input type="date" name="from" defaultValue={fromVal} />
        </div>

        <div>
          <Label>По дату</Label>
          <Input type="date" name="to" defaultValue={toVal} />
        </div>

        <div className="md:col-span-5 flex gap-2">
          <Button type="submit" className="bg-sky-600 hover:bg-sky-700">Применить</Button>
          <a href="/admin/orders">
            <Button type="button" variant="secondary">Сбросить</Button>
          </a>
        </div>
      </form>

      {orders.length === 0 ? (
        <p className="text-slate-600">Ничего не найдено.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
