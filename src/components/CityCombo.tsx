// src/components/CityCombo.tsx
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type RegisterOptions,
  type Path,
} from "react-hook-form";
import { CITIES } from "~/lib/cities";

type Props<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  // ВАЖНО: правильный generic для rules
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  placeholder?: string;
  /** макс. кол-во подсказок */
  limit?: number;
};

export default function CityCombo<TFieldValues extends FieldValues>({
  control,
  name,
  rules,
  placeholder = "Начните вводить город…",
  limit = 12,
}: Props<TFieldValues>) {
  // Убираем дубликаты и сортируем. Явно расширяем тип до string.
  const CITY_LIST = useMemo(
    () =>
      Array.from(new Set<string>(CITIES as readonly string[])).sort((a, b) =>
        a.localeCompare(b, "ru"),
      ),
    [],
  );
  const CITY_SET = useMemo(() => new Set<string>(CITY_LIST), [CITY_LIST]);

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: "Укажите город",
        validate: (v) => CITY_SET.has((v ?? "") as string) || "Выберите город из списка",
        ...rules,
      }}
      render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
        <CityComboInner
          value={(value ?? "") as string}
          onChange={(v) => onChange(v)}
          onBlur={onBlur}
          inputRef={ref}
          placeholder={placeholder}
          list={CITY_LIST}
          limit={limit}
          error={error?.message}
        />
      )}
    />
  );
}

function CityComboInner({
  value,
  onChange,
  onBlur,
  inputRef,
  placeholder,
  list,
  limit,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  inputRef?: React.Ref<any>;
  placeholder: string;
  list: string[];
  limit: number;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);
  const [idx, setIdx] = useState<number>(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list.slice(0, limit);
    return list.filter((c) => c.toLowerCase().includes(s)).slice(0, limit);
  }, [q, list, limit]);

  // синхронизируем внешнее значение
  useEffect(() => setQ(value ?? ""), [value]);

  // закрытие по клику вне
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (city: string) => {
    onChange(city);
    setQ(city);
    setOpen(false);
    setIdx(-1);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          const v = e.target.value;
          setQ(v);
          onChange(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 outline-none ring-1 transition ${
          error ? "border-rose-300 ring-rose-300" : "border-slate-200 ring-slate-200 focus:ring-sky-400"
        }`}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIdx((p) => Math.min(p + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIdx((p) => Math.max(p - 1, 0));
          } else if (e.key === "Enter") {
            if (open && filtered[idx]) {
              e.preventDefault();
              select(filtered[idx]);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />

      {open && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-xl bg-white p-1 shadow-lg ring-1 ring-slate-200">
          {filtered.map((c, i) => (
            <li
              key={`${c}-${i}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(c)}
              className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                i === idx ? "bg-sky-50 text-sky-700" : "hover:bg-slate-50"
              }`}
            >
              {c}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
