"use client";
import { useRef } from "react";
import { Button } from "~/components/ui/button";

const services = [
  "Перевезём посылку",
  "Заберём с почты",
  "Трезвый водитель",
  "Выгул питомца",
  "Отвезём договор/акт",
  "Курьер по городу",
  "Встреча/проводы в аэропорту",
  "Покупка и доставка",
  "Поможем с переездом",
  "Срочная отправка",
  "Фото/видео-проверка",
  "Очереди/МФЦ",
];

export default function ServicesStrip() {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    ref.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-slate-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-slate-50 to-transparent" />

      <div
        ref={ref}
        className="no-scrollbar snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        <div className="flex gap-4 pr-4">
          {services.map((t) => (
            <div
              key={t}
              className="snap-start rounded-2xl border bg-white px-6 py-6 shadow-sm"
              style={{ minWidth: 280 }}
            >
              <div className="font-medium">{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* arrows */}
      <div className="absolute -left-2 -top-10 flex gap-2 sm:-left-4 sm:top-1/2 sm:-translate-y-1/2">
        <Button size="icon" variant="secondary" onClick={() => scroll(-1)}>‹</Button>
        <Button size="icon" variant="secondary" onClick={() => scroll(1)}>›</Button>
      </div>

      {/* скрыть нативные полосы */}
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
