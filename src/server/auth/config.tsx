import type { NextAuthConfig } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
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

      // Не используется по факту (мы переопределяем sendVerificationRequest),
      // но поле обязательно — оставляем заглушку.
      server: process.env.SMTP_URL ?? "smtp://user:pass@localhost:587",

      async sendVerificationRequest({ identifier, url }) {
        // На dev будет видно в консоли
        console.log(`[auth] Magic link for ${identifier}: ${url}`);

        // Отправка письма через твой Resend-обёртку
        await sendMail({
          to: identifier,
          subject: "Вход на сайт — магическая ссылка",
          react: <MagicLinkEmail url={url} />,
        });
      },
    }),
  ],

  callbacks: {
    // Без any: типизируем параметры и аккуратно добавляем user.id
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub ?? undefined;
      }
      return session;
    },
  },
};
