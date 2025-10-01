"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CITIES } from "~/lib/cities";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

type Props = {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string | null;
  className?: string;
};

export default function CityCombobox({
  value,
  onChange,
  placeholder = "Выберите город",
  error,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = s.length
      ? CITIES.filter((c) => c.toLowerCase().includes(s))
      : CITIES;
    return base.slice(0, 200); // ограничим список
  }, [q]);

  // клик вне — закрываем
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // при открытии — проставить query
  useEffect(() => {
    if (open) {
      setQ(value ?? "");
      setActive(0);
    }
  }, [open, value]);

  function selectCity(city: string) {
    onChange(city);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(items.length - 1, i + 1));
      scrollActiveIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
      scrollActiveIntoView();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[active]) selectCity(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function scrollActiveIntoView() {
    const ul = listRef.current;
    if (!ul) return;
    const el = ul.children.item(active) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-left text-sm outline-none ring-0 transition hover:bg-slate-50 focus:ring-2 ${
          error ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-sky-200"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? "" : "text-slate-400"}>{value || placeholder}</span>
        <svg className="h-4 w-4 opacity-60" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="p-2">
            <Input
              autoFocus
              placeholder="Поиск города…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <div className="mt-2 flex justify-between gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQ("");
                }}
              >
                Очистить
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setOpen(false)}
                className="bg-slate-800 hover:bg-slate-900"
              >
                Закрыть
              </Button>
            </div>
          </div>

          <ul
            ref={listRef}
            className="max-h-64 overflow-auto border-t border-slate-100 py-1 text-sm"
            role="listbox"
          >
            {items.length === 0 && (
              <li className="px-3 py-2 text-slate-500">Ничего не найдено</li>
            )}
            {items.map((city, i) => (
              <li
                key={city}
                role="option"
                aria-selected={value === city}
                className={`cursor-pointer px-3 py-2 ${
                  i === active ? "bg-sky-50" : ""
                } ${value === city ? "font-medium text-sky-700" : "text-slate-800"}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => selectCity(city)}
              >
                {city}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
