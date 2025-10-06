import Image from "next/image";

export const metadata = { title: "О нас" };

type Block = {
  title: string;
  text: string;
  img: string;
  right?: boolean;
};

const blocks: Block[] = [
  {
    title: "Мы тщательно отбираем исполнителей",
    text: "Каждый исполнитель проходит проверку: репутация, анкета, опыт. Оставляем только тех, кому доверили бы своё поручение.",
    img: "/about/hero-1.png",
  },
  {
    title: "Ответственно относимся к каждой задаче",
    text: "Назначаем к заказу менеджера, следим за сроками и качеством. Пишем вам, когда есть новости.",
    img: "/about/hero-2.png",
    right: true,
  },
  {
    title: "Служим для удобства связи людей",
    text: "Помогаем там, где вас нет: купить, забрать, привезти, проверить. Всё прозрачно и без лишней волокиты.",
    img: "/about/hero-3.png",
  },
  {
    title: "Найдём исполнителя в любом городе",
    text: "Работаем по всей России. Подключаем локальных помощников и берём организацию на себя.",
    img: "/about/hero-4.png",
    right: true,
  },
];

/** === ПАРАМЕТРЫ ДЛЯ ИГРЫ С ПРИЛИПАНИЕМ ЛЕНТЫ === */
const RIBBON_OVERLAP_PX = 18;   // на сколько лента «выползает» из карточки вниз
const RIBBON_HEIGHT = 56;       // высота жёлтой ленты (px)
const LEGAL_BOTTOM_PADDING = 60; // нижний внутренний отступ в карточке, чтобы лента не наезжала на текст

export default function AboutPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/about/background.png')",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <h1 className="text-center text-3xl font-extrabold text-sky-700">О нас</h1>

        {/* Блоки с «человечками» */}
        <div className="space-y-6">
          {blocks.map((b, i) => (
            <section
              key={i}
              className="overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-slate-200"
            >
              <div
                className={`grid items-center gap-6 p-5 md:grid-cols-2 md:p-8 ${
                  b.right ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <Image
                  src={b.img}
                  alt=""
                  width={1200}
                  height={600}
                  className="h-auto w-full rounded-xl"
                  priority={i === 0}
                />
                <div>
                  <h2 className="text-xl font-semibold">{b.title}</h2>
                  <p className="mt-3 text-slate-600">{b.text}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Юридическая информация + «пристыкованная» к низу лента */}
        <section className="relative">
          {/* Карточка с дополнительным нижним padding и внешним отступом для воздуха */}
          <LegalInfo
            variant="card"
            className="mb-6"
            bottomPadding={LEGAL_BOTTOM_PADDING + RIBBON_OVERLAP_PX / 2}
          />

          {/* Лента, «приклеенная» к низу карточки, чуть выступает наружу */}
          <div
            className="absolute left-0 right-0"
            style={{ bottom: -RIBBON_OVERLAP_PX }}
          >
            <YellowRibbon
              text="У нас отличный саппорт, но надеемся, вы с ним никогда не встретитесь!"
              height={RIBBON_HEIGHT}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------- Юридическая информация -------------------- */

type LegalVariant = "card" | "grid" | "tiles";

function LegalInfo({
  variant = "card",
  className = "",
  bottomPadding = 0,
}: {
  variant?: LegalVariant;
  className?: string;
  /** дополнительный нижний padding, чтобы лента не наезжала на текст */
  bottomPadding?: number;
}) {
  const data = {
    name: "ИП Вогоровский Максим Михайлович",
    inn: "ИНН 244316923490",
    ogrn: "ОГРН 320246800081987",
    addr: "660100, Россия, Красноярский край, г. Красноярск",
    bik: "БИК 044525974",
  };

  // вспомогательный класс для добавления настраиваемого нижнего паддинга
  const padStyle = { paddingBottom: bottomPadding };

  if (variant === "grid") {
    return (
      <section
        className={`rounded-2xl bg-white/85 backdrop-blur-md shadow-sm ring-1 ring-slate-200 p-6 ${className}`}
        style={padStyle}
      >
        <h3 className="mb-4 text-center text-lg font-semibold text-sky-700">
          Юридическая информация
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="Организация" value={data.name} />
          <InfoRow label="ИНН" value={data.inn.replace("ИНН ", "")} />
          <InfoRow label="ОГРН" value={data.ogrn.replace("ОГРН ", "")} />
          <InfoRow label="БИК" value={data.bik.replace("БИК ", "")} />
          <InfoRow
            className="sm:col-span-2"
            label="Юридический адрес"
            value={data.addr}
          />
        </div>
      </section>
    );
  }

  if (variant === "tiles") {
    const tiles = [data.name, data.inn, data.ogrn, data.addr, data.bik];
    return (
      <section
        className={`rounded-2xl bg-white/85 backdrop-blur-md shadow-sm ring-1 ring-slate-200 p-6 ${className}`}
        style={padStyle}
      >
        <h3 className="mb-4 text-center text-lg font-semibold text-sky-700">
          Юридическая информация
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {tiles.map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-50 px-3 py-1.5 text-[13px] font-medium text-slate-700 ring-1 ring-slate-200 hover:text-sky-700"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    );
  }

  // ВАРИАНТ 1 — аккуратная карточка, вертикальный список с иконками (по умолчанию)
  return (
    <section
      className={`rounded-2xl bg-white/85 backdrop-blur-md shadow-sm ring-1 ring-slate-200 p-6 ${className}`}
      style={padStyle}
    >
      <h3 className="mb-3 text-center text-lg font-semibold text-sky-700">
        Юридическая информация
      </h3>
      <ul className="mx-auto max-w-3xl space-y-2">
        <LegalRow icon={<BuildingIcon />} text={data.name} />
        <LegalRow icon={<IdIcon />} text={data.inn} />
        <LegalRow icon={<ShieldIcon />} text={data.ogrn} />
        <LegalRow icon={<MapPinIcon />} text={data.addr} />
        <LegalRow icon={<BankIcon />} text={data.bik} />
      </ul>
    </section>
  );
}

function InfoRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg bg-slate-50/70 p-3 ring-1 ring-slate-200 ${className}`}>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function LegalRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3 rounded-lg bg-slate-50/70 p-3 ring-1 ring-slate-200">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <span className="text-sm font-medium text-slate-800">{text}</span>
    </li>
  );
}

/* --- маленькие иконки (SVG) --- */
function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...props}>
      <path d="M4 20h16M6 20V7a2 2 0 0 1 2-2h4l6 6v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 5v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IdIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 10h5M7 14h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...props}>
      <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...props}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}
function BankIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...props}>
      <path d="M4 10h16M6 10v7M10 10v7M14 10v7M18 10v7M3 21h18M12 3l9 5H3l9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* -------------------- Жёлтая лента -------------------- */

function YellowRibbon({ text, height = 56 }: { text: string; height?: number }) {
  const items = Array.from({ length: 8 }, () => text);

  return (
    <div className="relative -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10">
      {/* Едва заметная подложка (ровная полоса) */}
      <div
        className="absolute inset-0 rounded-lg bg-amber-300/40"
        style={{ height }}
      />
      {/* Основная наклонная лента */}
      <div
        className="relative rotate-[-3deg] overflow-hidden rounded-lg bg-amber-400 ring-1 ring-amber-500/30 shadow-md"
        style={{ height }}
      >
        {/* мягкие маски по краям */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-amber-400 to-amber-400/0" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-amber-400 to-amber-400/0" />

        <div className="relative flex h-full items-center">
          <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap px-6 font-semibold text-slate-900">
            {items.map((t, i) => (
              <span key={`a-${i}`} className="text-sm sm:text-base md:text-lg">
                {t} <span className="mx-4 opacity-60">•</span>
              </span>
            ))}
          </div>
          <div
            aria-hidden
            className="marquee-track flex w-max items-center gap-8 whitespace-nowrap px-6 font-semibold text-slate-900"
          >
            {items.map((t, i) => (
              <span key={`b-${i}`} className="text-sm sm:text-base md:text-lg">
                {t} <span className="mx-4 opacity-60">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
