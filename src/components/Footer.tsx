"use client";

export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-5">
        {/* Линия с реквизитами — одна строка, аккуратно переносится */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 md:text-sm">
          <span>ИП Вогоровский Максим Михайлович</span>
          <span className="hidden select-none text-slate-300 md:inline">•</span>

          <span>ИНН 244316923490</span>
          <span className="hidden select-none text-slate-300 md:inline">•</span>

          <span>ОГРН 320246800081987</span>
          <span className="hidden select-none text-slate-300 md:inline">•</span>

          <span>660100, Россия, Красноярский край, г. Красноярск</span>
          <span className="hidden select-none text-slate-300 md:inline">•</span>

          <span>БИК 044525974</span>
        </div>

        {/* Линия с почтой */}
        <div className="mt-2 text-xs text-slate-600 md:text-sm">
          <a
            href="mailto:info@yayestcorp.ru"
            className="hover:text-sky-700"
          >
            info@yayestcorp.ru
          </a>
        </div>
      </div>
    </footer>
  );
}
