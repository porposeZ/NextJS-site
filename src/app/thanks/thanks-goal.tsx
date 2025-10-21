// src/app/thanks/thanks-goal.tsx
"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    ym?: (...args: any[]) => void;
  }
}

const GOAL_NAME = "order_success"; // Создай в Метрике цель типа "JavaScript-событие" с таким именем

export default function ThanksGoal() {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.ym === "function") {
      try {
        // подменять id не нужно — возьмётся из глобальной функции ym
        // но чтобы наверняка — можно пробросить из ENV, если хочешь
        // @ts-ignore
        window.ym(window.__ymCounterId || undefined, "reachGoal", GOAL_NAME);
      } catch {}
    }
  }, []);

  return null;
}
