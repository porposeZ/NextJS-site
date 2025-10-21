// src/components/YandexMetrika.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    // достаточно общего типа без any
    ym?: (counterId: number, event: "hit", url: string) => void;
  }
}

type Props = { counterId: number };

export default function YandexMetrika({ counterId }: Props) {
  const pathname = usePathname();
  const search = useSearchParams();

  // hit на каждую смену маршрута
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.ym !== "function") return;

    const url = pathname + (search?.toString() ? `?${search.toString()}` : "");
    try {
      window.ym(counterId, "hit", url);
    } catch {
      // молча, чтобы не шуметь в консоли
    }
  }, [counterId, pathname, search]);

  return null;
}
