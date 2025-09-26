"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setState("sending");
    const res = await signIn("resend", { email, redirect: false, callbackUrl: "/orders" });
    if (res?.ok) setState("sent");
    else { setError("Не удалось отправить письмо."); setState("error"); }
  }

  return (
    <div className="mx-auto mt-16 max-w-md">
      <Card className="p-6">
        <h1 className="mb-1 text-2xl font-extrabold text-sky-700">Вход</h1>
        <p className="mb-6 text-sm text-slate-600">Укажи email — пришлём ссылку для входа.</p>

        {state === "sent" ? (
          <div className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Письмо отправлено. Проверь почту и перейди по ссылке.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Электронная почта</Label>
              <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full bg-orange-500 hover:bg-orange-600" disabled={state==="sending"}>
              {state==="sending" ? "Отправляем..." : "Получить ссылку"}
            </Button>
          </form>
        )}
      </Card>
      <p className="mt-4 text-center text-xs text-slate-500">
        Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
      </p>
    </div>
  );
}
