export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="font-black text-sky-700">Я есть</div>
          <div>Поручения и небольшие задачи</div>
        </div>

        <div className="grid gap-1 leading-5">
          <div>ИП Вогоровский Максим Михайлович</div>
          <div>ИНН 244316923490 · ОГРН 320246800081987</div>
          <div>660100, Россия, Красноярский край, г. Красноярск</div>
          <div>БИК 044525974 · <a href="mailto:info@yayestcorp.ru" className="hover:text-sky-700">info@yayestcorp.ru</a></div>
          <div className="text-[10px] text-slate-400">© {new Date().getFullYear()} Я есть</div>
        </div>
      </div>
    </footer>
  );
}
