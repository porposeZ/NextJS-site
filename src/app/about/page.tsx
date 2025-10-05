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

export default function AboutPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/about/background.png')",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        <h1 className="text-center text-3xl font-extrabold text-sky-700">О нас</h1>

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

        {/* Наклонная жёлтая лента с бесконечной прокруткой текста влево */}
        <YellowRibbon text="У нас отличный саппорт, но надеемся, вы с ним никогда не встретитесь!" />
      </div>
    </div>
  );
}

/** Наклонная жёлтая лента с подложкой */
function YellowRibbon({ text }: { text: string }) {
  const items = Array.from({ length: 8 }, () => text);

  return (
    <div className="relative -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10">
      {/* Едва заметная ровная подложка */}
      <div className="absolute inset-0 h-14 bg-amber-300/40 rounded-lg" />

      {/* Основная наклонная лента */}
      <div className="relative rotate-[-3deg] overflow-hidden rounded-lg bg-amber-400 ring-1 ring-amber-500/30 shadow-md">
        {/* мягкие маски по краям */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-amber-400 to-amber-400/0" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-amber-400 to-amber-400/0" />

        {/* Лента — бегущая строка */}
        <div className="marquee marquee-paused relative flex h-14 items-center">
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
