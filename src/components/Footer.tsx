import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="md:flex md:items-start md:justify-between">
          {/* Левая колонка — реквизиты (в 2 строки, как изначально) */}
          <Link
            href="/about"
            className="block text-xs leading-6 text-slate-600 transition-colors hover:text-sky-700 md:grow md:pr-6"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>ИП Вогоровский Максим Михайлович</span>
              <span className="text-slate-300">•</span>
              <span>ИНН 244316923490</span>
              <span className="text-slate-300">•</span>
              <span>ОГРН 320246800081987</span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>660100, Россия, Красноярский край, г. Красноярск</span>
              <span className="text-slate-300">•</span>
              <span>БИК 044525974</span>
            </div>
          </Link>

          {/* Разделитель */}
          <div className="my-4 hidden h-6 w-px bg-slate-200 md:my-0 md:block" />

          {/* Правая колонка — контакты */}
          <div className="text-xs leading-5 text-slate-600 md:w-64 md:pl-6">
            <div className="mb-2 font-semibold text-slate-800">Контакты</div>

            <ul className="space-y-1.5">
              <li>
                <a
                  href="mailto:info@yayestcorp.ru"
                  className="group flex items-center gap-2 font-medium text-slate-800 transition-colors hover:text-sky-700"
                >
                  <MailIcon className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
                  <span>info@yayestcorp.ru</span>
                </a>
              </li>

              <li>
                <a
                  href="tel:3912162584"
                  className="group flex items-center gap-2 font-medium text-slate-800 transition-colors hover:text-sky-700"
                >
                  <PhoneIcon className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
                  <span>+7 391 216-25-84</span>
                </a>
              </li>

              <li>
                <a
                  href="tel:+79233118858"
                  className="group flex items-center gap-2 font-medium text-slate-800 transition-colors hover:text-sky-700"
                >
                  <PhoneIcon className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
                  <span>+7 923 311-88-58</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* --- Иконки --- */
function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M5 7h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm0 0 7 5 7-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13.5l4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
