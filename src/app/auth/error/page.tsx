export const metadata = { title: "Ошибка входа" };

const messages: Record<string, string> = {
  Configuration: "Ошибка конфигурации авторизации.",
  AccessDenied: "Доступ запрещён.",
  Verification: "Ссылка недействительна или устарела. Запросите новую.",
  Default: "Не удалось войти. Попробуйте ещё раз.",
};

export default function AuthErrorPage(
  { searchParams }: { searchParams: { error?: string } }
) {
  const code = searchParams.error ?? "Default";

  return (
    <div className="mx-auto mt-24 max-w-md text-center">
      <h1 className="text-2xl font-extrabold text-red-600">Ошибка входа</h1>
      <p className="mt-3 text-slate-700">{messages[code] ?? messages.Default}</p>

      <a
        href="/auth/signin"
        className="mt-6 inline-block rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
      >
        Вернуться ко входу
      </a>
    </div>
  );
}
