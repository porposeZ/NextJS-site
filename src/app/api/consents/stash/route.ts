// src/app/api/consents/stash/route.ts
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      consent?: { policy?: boolean; orderEmails?: boolean; marketing?: boolean };
    };

    const email = (body.email ?? "").trim().toLowerCase();
    const policy = !!body.consent?.policy;
    const orderEmails = !!body.consent?.orderEmails;
    const marketing = !!body.consent?.marketing;

    // ставим долговечные куки на 5 лет — это наш «чек» согласий до входа
    const res = NextResponse.json({ ok: true });
    const maxAge = 60 * 60 * 24 * 365 * 5;

    if (email) res.cookies.set("consent_email", email, { maxAge, path: "/", sameSite: "lax" });
    if (policy) res.cookies.set("consent_policy", "1", { maxAge, path: "/", sameSite: "lax" });
    if (orderEmails) res.cookies.set("consent_order_emails", "1", { maxAge, path: "/", sameSite: "lax" });
    if (marketing) res.cookies.set("consent_marketing", "1", { maxAge, path: "/", sameSite: "lax" });

    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
