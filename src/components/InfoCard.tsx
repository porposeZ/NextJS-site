"use client";

interface InfoCardProps {
  title: string;
  text: string;
  index: number;
}

export default function InfoCard({ title, text, index }: InfoCardProps) {
  // Определяем фон по индексу
  const bgImage = `/InfoCard/info-${index + 1}.png`;

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* затемнение для читаемости текста */}
      <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]"></div>

      <div className="relative z-10">
        <div className="text-base font-semibold text-sky-800">{title}</div>
        <p className="mt-2 text-sm text-slate-700">{text}</p>
      </div>
    </div>
  );
}
