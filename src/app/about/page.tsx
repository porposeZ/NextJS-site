import Image from "next/image";

export const metadata = {
  title: "О нас",
};

type Feature = {
  title: string;
  image: string;
  imageSide?: "left" | "right";
};

const features: Feature[] = [
  {
    title: "Мы тщательно отбираем исполнителей",
    image: "/about/hero-1.png",
    imageSide: "left",
  },
  {
    title: "Ответственно относимся к каждой задаче",
    image: "/about/hero-2.png",
    imageSide: "right",
  },
  {
    title: "Служим для удобства связи людей",
    image: "/about/hero-3.png",
    imageSide: "left",
  },
  {
    title: "Найдем исполнителя в любом городе",
    image: "/about/hero-4.png",
    imageSide: "right",
  },
];

export default function AboutPage() {
  return (
    <div className="relative">
      {/* фоновые круги */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-sky-100" />
        <div className="absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-sky-100" />
        <div className="absolute -left-40 top-[38rem] h-[30rem] w-[30rem] rounded-full bg-sky-100" />
        <div className="absolute -right-44 top-[68rem] h-[26rem] w-[26rem] rounded-full bg-sky-100" />
      </div>

      <h1 className="mb-8 text-center text-3xl font-extrabold text-sky-700 md:text-4xl">
        О нас
      </h1>

      <div className="space-y-6">
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>

      {/* Желтая полоса снизу */}
      <p className="mt-8 rounded-md bg-yellow-300 px-4 py-3 text-center text-sm font-semibold text-slate-900">
        У нас отличная поддержка, но вы с ней никогда не встретитесь!
      </p>
    </div>
  );
}

function FeatureCard({ title, image, imageSide = "left" }: Feature) {
  const img = (
    <div className="flex h-20 w-20 items-center justify-center rounded-full overflow-hidden bg-white ring-1 ring-sky-200 shadow-sm md:h-24 md:w-24">
      <Image
        src={image}
        alt=""
        width={96}
        height={96}
        className="h-full w-full object-cover"
        aria-hidden
      />
    </div>
  );

  return (
    <article className="rounded-2xl border bg-white/90 p-4 shadow-sm md:p-6">
      <div
        className={`flex items-center gap-4 md:gap-6 ${
          imageSide === "right" ? "flex-row-reverse" : ""
        }`}
      >
        {img}
        <h3 className="text-lg font-semibold leading-snug text-slate-800 md:text-xl">
          {title}
        </h3>
      </div>
    </article>
  );
}
