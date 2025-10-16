import { redirect } from "next/navigation";
import { getSession } from "~/server/auth/getSession";
import { Card } from "~/components/ui/card";
import SignInForm from "./SignInForm";

type SearchParams = { callbackUrl?: string };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  const { callbackUrl } = await searchParams;

  const target =
    typeof callbackUrl === "string" && callbackUrl.length > 0
      ? callbackUrl
      : "/orders";

  if (session?.user?.id) {
    redirect(target);
  }

  return (
    <div className="mx-auto mt-16 max-w-lg">
      <Card className="p-6 md:p-8">
        <h1 className="mb-4 text-2xl font-extrabold text-sky-700">Вход</h1>
        <p className="mb-6 text-slate-600">
          Укажи email — пришлём ссылку для входа. Перед отправкой отметь согласия ниже.
        </p>

        {/* Больше не нужен никакой CSRF */}
        <SignInForm callbackUrl={target} />
      </Card>
    </div>
  );
}
