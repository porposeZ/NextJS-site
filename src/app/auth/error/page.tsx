// src/app/auth/error/page.tsx
import Link from "next/link";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

type SearchParams = { error?: string };

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { error } = await searchParams;
  const code = error ?? "Default";

  return (
    <div className="mx-auto mt-24 max-w-md text-center">
      <Card className="p-8">
        <h1 className="mb-3 text-2xl font-bold text-red-600">Ошибка входа</h1>
        <p className="mb-6 text-slate-700">
          {code === "Verification"
            ? "Ссылка недействительна или уже использована."
            : "Ошибка конфигурации авторизации."}
        </p>
        <Button asChild>
          <Link href="/auth/signin">Вернуться ко входу</Link>
        </Button>
      </Card>
    </div>
  );
}
