import { redirect } from "next/navigation";
import { db } from "~/server/db";         // проверь путь в своём проекте
import { auth } from "~/server/auth";     // именованный экспорт из src/server/auth
import NewOrderForm from "./NewOrderForm";
import { orderSchema } from "./schema";

// ⬇ Server Action: объявлен в серверном модуле + "use server"
export async function createOrderAction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  // FormData -> объект -> валидация
  const raw = Object.fromEntries(formData.entries());
  const parsed = orderSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  await db.order.create({
    data: {
      userId: session.user.id,
      city: data.city,
      description: data.description,
      budget: typeof data.budget === "number" ? data.budget : undefined,
    },
  });

  redirect("/orders");
}

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  // Передаём Server Action пропсом в клиентскую форму
  return <NewOrderForm action={createOrderAction} />;
}