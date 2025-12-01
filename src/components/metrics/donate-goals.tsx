// src/components/metrics/donate-goals.tsx
"use client";

import { useEffect } from "react";

const METRIKA_ID = 105542413;
const GOAL_ORDER = "order_success";
const GOAL_PAYMENT_SUCCESS = "payment_success";
const GOAL_PAYMENT_FAIL = "payment_fail";

export function DonateGoals({ status }: { status?: string | null }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ym = (window as unknown as { ym?: (...args: unknown[]) => void }).ym;
    if (typeof ym !== "function") return;

    const fire = (goal: string) => {
      try {
        ym(METRIKA_ID, "reachGoal", goal);
      } catch {
        /* ignore */
      }
    };

    const s = (status ?? "").trim().toLowerCase();
    if (s === "success") {
      fire(GOAL_ORDER);
      fire(GOAL_PAYMENT_SUCCESS);
    } else if (s) {
      // Любое иное значение статуса считаем неуспехом
      fire(GOAL_PAYMENT_FAIL);
    }
  }, [status]);

  return null;
}
