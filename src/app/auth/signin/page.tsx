import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "~/server/auth/getSession";
import { Card } from "~/components/ui/card";
import SignInForm from "./SignInForm";

type SearchParams = { callbackUrl?: string };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Уже авторизован? — уводим на callbackUrl или /orders
  const session = await getSession();
  const { callbackUrl } = await searchParams;

  const target =
    typeof callbackUrl === "string" && callbackUrl.length > 0
      ? callbackUrl
      : "/orders";

  if (session?.user?.id) {
    redirect(target);
  }

  // Берём CSRF из куки, если уже есть
  const raw = (await cookies()).get("authjs.csrf-token")?.value ?? "";
  const initialCsrfToken = raw.includes("|") ? raw.split("|")[0] : raw;

  return (
    <div className="mx-auto mt-16 max-w-lg">
      <Card className="p-6 md:p-8">
        <h1 className="mb-4 text-2xl font-extrabold text-sky-700">Вход</h1>
        <p className="mb-6 text-slate-600">
          Укажи email — пришлём ссылку для входа.
        </p>

        <SignInForm initialCsrfToken={initialCsrfToken} callbackUrl={target} />

        <p className="mt-6 text-center text-xs text-slate-500">
          Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
        </p>
      </Card>
    </div>
  );
}
