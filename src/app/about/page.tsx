import RevealOnScroll from "~/components/reveal/RevealOnScroll";
import { Card } from "~/components/ui/card";

export const metadata = { title: "О нас" };

const ITEMS = [
  {
    title: "Тщательный отбор исполнителей",
    text: "Каждый кандидат проходит ручную модерацию, собеседование и проверку документов.",
  },
  {
    title: "Поддержка и контроль",
    text: "Персональный менеджер сопровождает ваш заказ и контролирует сроки на каждом этапе.",
  },
  {
    title: "Безопасные платежи",
    text: "Оплачивайте удобным способом. Чеки и закрывающие документы по запросу.",
  },
  {
    title: "Прозрачные условия",
    text: "Стоимость согласуется заранее — без скрытых платежей и навязанных услуг.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-sky-700">О нас</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((it, i) => (
          <RevealOnScroll key={it.title} delay={i * 120}>
            <Card className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-base font-semibold">{it.title}</div>
              <div className="mt-1 text-sm text-slate-600">{it.text}</div>
            </Card>
          </RevealOnScroll>
        ))}
      </div>

      <p className="text-sm text-slate-600">
        Мы ежедневно помогаем людям и компаниям решать задачи в разных городах России —
        быстро, безопасно и по справедливой цене.
      </p>
    </div>
  );
}
