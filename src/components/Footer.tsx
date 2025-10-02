export default function Footer() {
  return (
    <footer className="mt-10 border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-slate-600">
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
          <div>ИП Вогоровский Максим Михайлович</div>
          <div className="hidden sm:block">•</div>
          <div>ИНН 244316923490</div>
          <div className="hidden sm:block">•</div>
          <div>ОГРН 320246800081987</div>
          <div className="hidden sm:block">•</div>
          <div>660100, Россия, Красноярский край, г. Красноярск</div>
          <div className="hidden sm:block">•</div>
          <div>БИК 044525974</div>
          <div className="hidden sm:block">•</div>
          <a href="mailto:info@yayestcorp.ru" className="hover:text-slate-900">
            info@yayestcorp.ru
          </a>
        </div>
      </div>
    </footer>
  );
}
