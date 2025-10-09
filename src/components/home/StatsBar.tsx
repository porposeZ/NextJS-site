export default function StatsBar() {
  return (
    <section className="mx-auto mt-6 max-w-5xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold tracking-tight">9 000+</div>
          <div className="mt-1 text-sm text-slate-600">
            исполнителей готовы помочь
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-3xl font-extrabold tracking-tight">18 523</div>
          <div className="mt-1 text-sm text-slate-600">выполненных заказа</div>
        </div>
      </div>
    </section>
  );
}
