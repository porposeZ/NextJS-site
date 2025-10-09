// src/components/ServicesStrip.tsx
"use client";

import type { JSX } from "react";
import Image from "next/image";

const services = [
  "Встретим",
  "Выкупим",
  "Доставим",
  "Заберем",
  "Отправим",
  "Перевезем",
  "Подарим",
  "Получим",
  "Представим интересы",
  "Проверим",
  "Проконтролируем",
  "Сопроводим",
  "Сфотографируем",
] as const;

// Позиции картинки по вертикали — явно типизированный Array.from
const OBJECT_POSITIONS: ReadonlyArray<string> = Array.from(
  { length: services.length },
  (): string => "center 80%",
);

// Подъём картинки (px) — у "Представим интересы" (index 8) немного выше
const BASE_LIFT = -14 as const;
const LIFT_PX: ReadonlyArray<number> = Array.from(
  { length: services.length },
  (_: unknown, i: number): number => (i === 8 ? BASE_LIFT - 3 : BASE_LIFT),
);

export default function ServicesStrip(): JSX.Element {
  // Явная типизация — без any
  const doubled: readonly string[] = [...services, ...services];

  // Явно типизируем результат map, чтобы не было any
  const items: JSX.Element[] = doubled.map((title, i) => {
    const realIndex = i % services.length;
    const src = `/services/service-${realIndex + 1}.png`;

    return (
      <div
        key={`${title}-${i}`}
        className="relative mx-2 my-2 h-[200px] min-w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${LIFT_PX[realIndex]}px)`,
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 768px) 360px, 400px"
            priority={false}
            style={{
              objectFit: "contain",
              objectPosition: OBJECT_POSITIONS[realIndex],
            }}
          />
        </div>

        {/* Нижняя подпись */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-white/85 px-5 py-2 text-center text-[15px] font-semibold text-slate-900 shadow-[0_-8px_16px_-12px_rgba(0,0,0,0.2)] backdrop-blur">
          {title}
        </div>
      </div>
    );
  });

  return (
    <div className="group select-none">
      <div className="relative overflow-hidden">
        {/* Лента */}
        <div className="marquee flex">{items}</div>

        {/* Анимация ленты */}
        <style jsx>{`
          .marquee {
            width: max-content;
            animation: scroll-left 40s linear infinite;
          }
          .group:hover .marquee {
            animation-play-state: paused;
          }
          @keyframes scroll-left {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          :global(.marquee)::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
}
