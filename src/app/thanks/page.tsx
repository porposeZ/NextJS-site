// src/app/thanks/page.tsx
import type { Metadata } from "next";
import ThanksGoal from "./thanks-goal";

export const metadata: Metadata = {
  title: "Заявка отправлена",
  description: "Спасибо! Мы уже обрабатываем вашу заявку.",
};

export default function ThanksPage() {
  return (
    <div className="mx-auto max-w-2xl text-center space-y-4">
      <h1 className="text-3xl font-semibold">Спасибо! Заявка отправлена</h1>
      <p className="text-slate-600">Мы свяжемся с вами в ближайшее время.</p>
      {/* Отправляем цель Метрики сразу после маунта */}
      <ThanksGoal />
    </div>
  );
}
