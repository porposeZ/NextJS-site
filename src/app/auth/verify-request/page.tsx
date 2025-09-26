export const metadata = { title: "Проверьте почту" };

export default function VerifyRequestPage() {
  return (
    <div className="mx-auto mt-24 max-w-md text-center">
      <h1 className="text-2xl font-extrabold text-sky-700">Проверьте почту</h1>
      <p className="mt-3 text-slate-600">
        Мы отправили письмо со ссылкой для входа. Откройте письмо и перейдите по кнопке.
        Если письма нет — проверьте папку «Спам».
      </p>
      <div className="mt-6 text-xs text-slate-500">
        Ссылка одноразовая и действует ограниченное время.
      </div>
    </div>
  );
}