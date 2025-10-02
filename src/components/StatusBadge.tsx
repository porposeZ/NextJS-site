type Status =
  | "REVIEW"
  | "AWAITING_PAYMENT"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELED";

const map = {
  REVIEW: {
    ru: "На проверке",
    class: "bg-slate-100 text-slate-700",
  },
  AWAITING_PAYMENT: {
    ru: "Ждёт оплаты",
    class: "bg-amber-100 text-amber-800",
  },
  IN_PROGRESS: {
    ru: "В работе",
    class: "bg-sky-100 text-sky-800",
  },
  DONE: {
    ru: "Готово",
    class: "bg-emerald-100 text-emerald-800",
  },
  CANCELED: {
    ru: "Отменён",
    class: "bg-rose-100 text-rose-800",
  },
} as const;

export default function StatusBadge({ status }: { status: Status }) {
  const m = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${m.class}`}
      title={status}
    >
      <span className="leading-none">{m.ru}</span>
      <span className="ml-1 hidden leading-none text-[10px] opacity-70 sm:inline">
        · {status}
      </span>
    </span>
  );
}
