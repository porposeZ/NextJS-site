import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";

import { db } from "~/server/db";
import { env } from "~/server/env";

import { sendMail } from "~/server/email/send";
import MagicLinkEmail from "~/emails/MagicLinkEmail";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),

  trustHost: env.AUTH_TRUST_HOST === "true",
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",

  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },

  providers: [
    EmailProvider({
      from: env.EMAIL_FROM,

      // Добавили "server", чтобы провайдер не ругался (он не используется,
      // т.к. мы полностью переопределяем отправку sendVerificationRequest).
      server: process.env.SMTP_URL ?? "smtp://user:pass@localhost:587",

      async sendVerificationRequest({ identifier, url }) {
        // всегда печатаем ссылку в консоль (на dev можно кликнуть прямо отсюда)
        console.log(`[auth] Magic link for ${identifier}: ${url}`);

        // твоя отправка письма (Resend внутри sendMail)
        await sendMail({
          to: identifier,
          subject: "Вход на сайт — магическая ссылка",
          react: <MagicLinkEmail url={url} />,
        });
      },
    }),
  ],

  callbacks: {
    async session({ session, user, token }) {
      const id = user?.id ?? token?.sub ?? (session.user as any)?.id;
      if (id) (session.user as any) = { ...session.user, id };
      return session;
    },
  },
};
