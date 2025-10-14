"use client";
import { useEffect } from "react";

/**
 * Если у пользователя остались куки consent_*
 * — один раз дергаем /api/consents/attach после входа.
 */
export default function ConsentAttach() {
  useEffect(() => {
    const has =
      document.cookie.includes("consent_policy=") ||
      document.cookie.includes("consent_order_emails=") ||
      document.cookie.includes("consent_marketing=");

    if (!has) return;
    const key = "consent_attach_done";
    if (sessionStorage.getItem(key)) return;

    fetch("/api/consents/attach", { method: "POST" }).finally(() => {
      sessionStorage.setItem(key, "1");
    });
  }, []);

  return null;
}
