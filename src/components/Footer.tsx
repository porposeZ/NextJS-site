export default function Footer() {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="font-semibold text-slate-800">ИП Вогоровский Максим Михайлович</div>
            <div className="mt-1">ИНН 244316923490 · ОГРН 320246800081987</div>
            <div>660100, Россия, Красноярский край, г. Красноярск</div>
          </div>
          <div>
            <div>БИК 044525974</div>
            <div className="mt-1">
              Почта:{" "}
              <a href="mailto:info@yayestcorp.ru" className="text-sky-700 hover:underline">
                info@yayestcorp.ru
              </a>
            </div>
          </div>
        </div>
        <div className="mt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Я есть. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
