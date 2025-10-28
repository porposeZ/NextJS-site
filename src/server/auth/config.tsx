import type { NextAuthConfig } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import React from "react";

import { db } from "~/server/db";
import { env } from "~/server/env";
import { sendMail } from "~/server/email/send";
import MagicLinkEmail from "~/emails/MagicLinkEmail";

// 1) Базовый URL авторизации — обязан быть задан
const RAW_BASE_AUTH_URL = env.NEXTAUTH_URL || env.AUTH_URL;
if (!RAW_BASE_AUTH_URL) {
  throw new Error("Configure NEXTAUTH_URL or AUTH_URL (e.g. https://yayest.site)");
}

const BASE_URL = new URL(RAW_BASE_AUTH_URL);

// 2) Домен для куки: .yayest.site (работает и на www, и на корне)
const ROOT_HOST = BASE_URL.hostname.replace(/^www\./, "");
const COOKIE_DOMAIN = `.${ROOT_HOST}`;

// 3) Хост, который разрешаем в магической ссылке (строго из env)
const ALLOWED_HOST = BASE_URL.hostname;

// Любая валидная SMTP-строка, чтобы провайдер не ругался (фактически не используется)
const DUMMY_SMTP_URL = process.env.SMTP_URL ?? "smtp://user:pass@localhost:587";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),

  // В проде за CDN/прокси это должно быть true
  trustHost: true,

  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",

  // 4) Явно задаём куку с доменом .yayest.site
  //    Имя куки оставляем дефолтным, но даём опции домена/безопасности.
  cookies: {
    sessionToken: {
      // В проде NextAuth сам префиксует __Secure-, если secure=true и HTTPS.
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        domain: COOKIE_DOMAIN, // ← критично
        path: "/",
        sameSite: "lax",
        httpOnly: true,
        secure: true,
      },
    },
  },

  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },

  providers: [
    EmailProvider({
      server: DUMMY_SMTP_URL,
      from: env.EMAIL_FROM,
      maxAge: 10 * 60,
      async sendVerificationRequest({ identifier, url }) {
        const parsed = new URL(url);

        // Разрешаем только тот хост, что задан в env (защита от несоответствий)
        if (parsed.hostname !== ALLOWED_HOST) {
          throw new Error("Disallowed callback host");
        }

        if (process.env.NODE_ENV !== "production") {
          console.log(`[auth] Magic link for ${identifier}: ${parsed.toString()}`);
        }

        await sendMail({
          to: identifier,
          subject: "Вход на сайт «Я есть»",
          react: <MagicLinkEmail url={parsed.toString()} />,
        });
      },
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        if (u.origin === baseUrl && u.pathname.startsWith("/")) return u.toString();
      } catch {}
      return baseUrl;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) (session.user as { id?: string }).id = token.sub ?? undefined;
      return session;
    },
  },
};
