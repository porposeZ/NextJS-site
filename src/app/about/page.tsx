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
    <div className="space-y-6">
      <h1 className="text-center text-3xl font-extrabold text-sky-700">О нас</h1>

      <div className="space-y-6">
        {blocks.map((b, i) => (
          <section
            key={i}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
          >
            <div className={`grid items-center gap-6 p-5 md:grid-cols-2 md:p-8 ${b.right ? "md:[&>*:first-child]:order-2" : ""}`}>
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

      {/* Жёлтая лента */}
      <div className="rounded-xl bg-yellow-400 px-4 py-3 text-center text-sm font-medium text-slate-900 shadow-sm">
        У нас отличная поддержка, но вы с ней никогда не встретитесь!
      </div>
    </div>
  );
}
