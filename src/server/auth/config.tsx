import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";

// ❗️ВМЕСТО EmailProvider — используем ResendProvider
import ResendProvider from "next-auth/providers/resend";

import { db } from "~/server/db";
import { env } from "~/server/env";

// наш helper для писем и react-шаблон
import { sendMail } from "~/server/email/send";
import MagicLinkEmail from "~/emails/MagicLinkEmail";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),

  providers: [
    ResendProvider({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,

      // Кастомная отсылка маг. ссылки (через наш helper + React-шаблон)
      async sendVerificationRequest({ identifier, url }) {
        await sendMail({
          to: identifier,
          subject: "Вход на сайт — магическая ссылка",
          react: <MagicLinkEmail url={url} />,
        });
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },

  callbacks: {
    async session({ session, user }) {
      // проброс id в session.user
      return { ...session, user: { ...session.user, id: user.id } };
    },
  },
};
