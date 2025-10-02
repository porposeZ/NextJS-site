type Status =
  | "REVIEW"
  | "AWAITING_PAYMENT"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELED";

const map: Record<
  Status,
  { ru: string; cls: string }
> = {
  REVIEW: { ru: "На рассмотрении", cls: "bg-slate-100 text-slate-700 ring-slate-200" },
  AWAITING_PAYMENT: { ru: "Ждёт оплаты", cls: "bg-amber-100 text-amber-800 ring-amber-200" },
  IN_PROGRESS: { ru: "В работе", cls: "bg-sky-100 text-sky-800 ring-sky-200" },
  DONE: { ru: "Выполнено", cls: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  CANCELED: { ru: "Отменено", cls: "bg-rose-100 text-rose-800 ring-rose-200" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const m = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${m.cls}`}
      title={status}
    >
      {m.ru}
      <span className="ml-1 text-[10px] opacity-70">({status})</span>
    </span>
  );
}
