"use client";

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

// Позиции картинки по вертикали
const OBJECT_POSITIONS: readonly string[] = Array(services.length).fill("center 80%");

// Подъём картинки (px) — у "Представим интересы" (index 8) немного выше
const LIFT_PX: readonly number[] = Array(services.length)
  .fill(-14)
  .map((val, i) => (i === 8 ? val - 3 : val));

export default function ServicesStrip() {
  const doubled = [...services, ...services];

  return (
    <div className="group select-none">
      <div className="relative overflow-hidden">
        {/* Лента */}
        <div className="marquee flex">
          {doubled.map((title, i) => {
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
                <div className="absolute inset-x-0 bottom-0 z-10 bg-white/85 backdrop-blur px-5 py-2 text-center text-[15px] font-semibold text-slate-900 shadow-[0_-8px_16px_-12px_rgba(0,0,0,0.2)]">
                  {title}
                </div>
              </div>
            );
          })}
        </div>

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
