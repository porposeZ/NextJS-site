// src/components/Footer.tsx
export default function Footer() {
  const items = [
    "ИП Вогоровский Максим Михайлович",
    "ИНН 244316923490",
    "ОГРН 320246800081987",
    "660100, Россия, Красноярский край, г. Красноярск",
    "БИК 044525974",
  ];

  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="md:flex md:items-start md:justify-between">
          {/* Левая колонка — реквизиты */}
          <div className="text-xs leading-6 text-slate-600 md:pr-6 md:grow">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {items.map((txt, i) => (
                <div key={txt} className="flex items-center">
                  {i > 0 && (
                    <span className="mx-3 hidden text-slate-300 md:inline">•</span>
                  )}
                  <span>{txt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Разделитель */}
          <div className="my-4 hidden h-6 w-px bg-slate-200 md:my-0 md:block" />

          {/* Правая колонка — контакты */}
          <div className="text-xs leading-6 text-slate-600 md:pl-6 md:min-w-60">
            <div className="mb-2 font-semibold text-slate-800">Контакты</div>

            <div className="flex flex-col gap-1.5">
              <a
                href="mailto:info@yayestcorp.ru"
                className="font-medium text-slate-800 hover:text-sky-700"
              >
                info@yayestcorp.ru
              </a>

              <a
                href="tel:3912162584"
                className="font-medium text-slate-800 hover:text-sky-700"
              >
                3912162584
              </a>

              <a
                href="tel:+79233118858"
                className="font-medium text-slate-800 hover:text-sky-700"
              >
                +7 923 311 8858
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
