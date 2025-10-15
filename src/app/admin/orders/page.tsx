// src/app/admin/orders/page.tsx
import { Prisma, OrderStatus } from "@prisma/client";
import { requireAdmin } from "~/server/auth/roles";
import { db } from "~/server/db";
import OrderCard from "./OrderCard";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const metadata = { title: "Все заказы — Админ" };

// Статусы берём из Prisma-энама, чтобы совпадало с БД
const STATUSES: readonly OrderStatus[] = [
  OrderStatus.REVIEW,
  OrderStatus.AWAITING_PAYMENT,
  OrderStatus.IN_PROGRESS,
  OrderStatus.DONE,
  OrderStatus.CANCELED,
] as const;

type SearchParamsDict = Record<string, string | string[] | undefined>;

/** Тип, который ждёт OrderCard */
type OrderForCard = {
  id: string;
  city: string;
  description: string;
  createdAt: Date | string;
  dueDate: Date | string | null;
  status: OrderStatus;
  user: {
    email: string | null;
    name: string | null;
    phone: string | null;
  };
  events: {
    id: string;
    message: string; // строго string — без null
    createdAt: Date | string;
  }[];
};

function norm(str: string | null | undefined) {
  return (str ?? "").toLocaleLowerCase("ru-RU");
}
function onlyDigits(s: string | null | undefined) {
  return (s ?? "").replace(/\D/g, "");
}
function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  // В Next 15.5 searchParams в Server Component — Promise
  searchParams: Promise<SearchParamsDict>;
}) {
  await requireAdmin();

  const sp = await searchParams;

  const qVal = (first(sp.q) ?? "").trim();
  const statusRaw = first(sp.status) ?? "";
  const fromVal = first(sp.from) ?? "";
  const toVal = first(sp.to) ?? "";

  // where — строго типизировано
  const where: Prisma.OrderWhereInput = {};

  // фильтр по статусу — только корректные значения
  const statusOk = STATUSES.includes(statusRaw as OrderStatus);
  if (statusOk) {
    where.status = statusRaw as OrderStatus;
  }

  // фильтр по датам создания
  if (fromVal || toVal) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (fromVal) createdAt.gte = new Date(`${fromVal}T00:00:00.000Z`);
    if (toVal) createdAt.lte = new Date(`${toVal}T23:59:59.999Z`);
    where.createdAt = createdAt;
  }

  // ✅ Жёсткий select — берём только то, что нужно OrderCard
  const candidates = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      city: true,
      description: true, // в схеме @map("details"), но поле в Prisma — description
      createdAt: true,
      dueDate: true,
      status: true,
      user: { select: { email: true, name: true, phone: true } },
      events: {
        select: { id: true, message: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  // Поиск текста и телефона делаем в памяти (из-за кириллицы/частичных совпадений)
  const needle = qVal.toLocaleLowerCase("ru-RU");
  const needleDigits = onlyDigits(qVal);

  const filtered = qVal
    ? candidates.filter((o) => {
        const hay = [norm(o.city), norm(o.description), norm(o.user?.email), norm(o.user?.name)];
        const byText = hay.some((h) => h.includes(needle));

        const phoneDigits = onlyDigits(o.user?.phone);
        const byPhone = needleDigits.length > 0 && phoneDigits.includes(needleDigits);

        return byText || byPhone;
      })
    : candidates;

  // ✅ Нормализуем к точному типу, который ждёт OrderCard
  const orders: OrderForCard[] = filtered.map((o) => ({
    id: o.id,
    city: o.city,
    description: o.description,
    createdAt: o.createdAt,
    dueDate: o.dueDate ?? null,
    status: o.status,
    user: {
      email: o.user?.email ?? null,
      name: o.user?.name ?? null,
      phone: o.user?.phone ?? null,
    },
    events: (o.events ?? []).map((e) => ({
      id: e.id,
      message: e.message ?? "", // ← ключевая нормализация: string, не null
      createdAt: e.createdAt,
    })),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sky-700">Все заказы</h1>

      {/* Фильтр */}
      <form method="get" className="grid grid-cols-1 items-end gap-3 md:grid-cols-5">
        <div className="md:col-span-2">
          <Label>Поиск</Label>
          <Input name="q" defaultValue={qVal} placeholder="Город, описание, email, имя или телефон" />
        </div>

        <div>
          <Label>Статус</Label>
          <select
            name="status"
            defaultValue={statusOk ? (statusRaw as OrderStatus) : ""}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Любой</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
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

        <div className="flex gap-2 md:col-span-5">
          <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
            Применить
          </Button>
          <a href="/admin/orders">
            <Button type="button" variant="secondary">
              Сбросить
            </Button>
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
