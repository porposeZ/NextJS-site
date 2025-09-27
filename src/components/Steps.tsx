import Image from "next/image";
import { Card } from "./ui/card";

const steps = [
  { title: "Создаёте заказ", img: "/steps/step1-create.png" },
  { title: "Свяжется менеджер", img: "/steps/step2-contact.png" },
  { title: "Оплатите заказ", img: "/steps/step3-pay.png" },
  { title: "Подбор исполнителя", img: "/steps/step4-select.png" },
  { title: "Выполнение задачи", img: "/steps/step5-do.png" },
  { title: "Отчёт", img: "/steps/step6-report.png" },
];

export default function Steps() {
  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
      {steps.map((s) => (
        <Card
          key={s.title}
          className="flex flex-col items-center gap-2 p-4 text-center text-sm shadow-md transition-transform hover:-translate-y-2 hover:shadow-lg"
        >
          <div className="relative h-20 w-20">
            <Image
              src={s.img}
              alt={s.title}
              fill
              className="object-contain"
            />
          </div>
          <p>{s.title}</p>
        </Card>
      ))}
    </section>
  );
}
