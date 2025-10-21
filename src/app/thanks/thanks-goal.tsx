// src/app/thanks/thanks-goal.tsx
"use client";

import { useEffect } from "react";

const GOAL_NAME = "order_success"; // Цель в Я.Метрике типа "JavaScript-событие"

export default function ThanksGoal() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Берём ym без повторного объявления типов, чтобы не конфликтовать с глобальной декларацией
    const ym = (window as unknown as { ym?: (...a: unknown[]) => void }).ym;

    if (typeof ym === "function") {
      try {
        // если в окне лежит id счётчика — используем его; иначе Метрика возьмёт "текущий"
        const counterId =
          (window as unknown as { __ymCounterId?: number }).__ymCounterId;

        ym(counterId as unknown as number, "reachGoal", GOAL_NAME);
      } catch {
        // молча игнорируем
      }
    }
  }, []);

  return null;
}
