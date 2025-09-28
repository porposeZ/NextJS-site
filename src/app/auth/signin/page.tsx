import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "~/server/auth/getSession";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type SearchParams = { callbackUrl?: string };

async function getCsrfToken() {
  // Получаем origin, чтобы серверно сходить за CSRF токеном
  const origin =
    headers().get("origin") ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";

  const res = await fetch(`${origin}/api/auth/csrf`, { cache: "no-store" });
  if (!res.ok) return "";
  const data = (await res.json()) as { csrfToken?: string };
  return data.csrfToken ?? "";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { callbackUrl } = await searchParams;

  // Уже авторизован? — уводим на callbackUrl или /orders
  const session = await getSession();
  if (session?.user?.id) {
    redirect(typeof callbackUrl === "string" ? callbackUrl : "/orders");
  }

  const csrfToken = await getCsrfToken();

  return (
    <div className="mx-auto mt-16 max-w-lg">
      <Card className="p-6 md:p-8">
        <h1 className="mb-4 text-2xl font-extrabold text-sky-700">Вход</h1>
        <p className="mb-6 text-slate-600">
          Укажи email — пришлём ссылку для входа.
        </p>

        {/* ВАЖНО: action указывает на email-провайдер и есть скрытый csrfToken */}
        <form method="post" action="/api/auth/signin/email" className="grid gap-4">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input
            type="hidden"
            name="callbackUrl"
            value={typeof callbackUrl === "string" ? callbackUrl : "/orders"}
          />

          <div>
            <Label>Электронная почта</Label>
            <Input
              type="email"
              name="email"
              placeholder="you@mail.ru"
              required
            />
          </div>

          <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
            Получить ссылку
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
        </p>
      </Card>
    </div>
  );
}
