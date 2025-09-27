import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import ResendProvider from "next-auth/providers/resend";
import { db } from "~/server/db";

import { Resend } from "resend";
import { renderAsync } from "@react-email/render";
import MagicLinkEmail from "~/emails/MagicLinkEmail";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),

  // Сессии только через JWT (никаких запросов к БД из middleware)
  session: { strategy: "jwt" },

  providers: [
    ResendProvider({
      apiKey: process.env.RESEND_API_KEY!,   // ключ из Resend
      from: process.env.EMAIL_FROM!,         // например: onboarding@resend.dev (sandbox)
      // Кастомная отправка письма: свой HTML-шаблон
      async sendVerificationRequest({ identifier, url, provider }) {
        const html = await renderAsync(<MagicLinkEmail url={url} />);

        // свой экземпляр клиента Resend с ключом провайдера
        const resend = new Resend(provider.apiKey as string);

        const { error } = await resend.emails.send({
          from: provider.from as string,
          to: identifier,
          subject: "Вход на сайт — магическая ссылка",
          html,
        });

        if (error) throw new Error(String(error));
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },

  callbacks: {
    // Кладём id юзера в JWT при логине
    async jwt({ token, user }) {
      if (user) token.id = (user as any).id;
      return token;
    },
    // Возвращаем id в session.user.id
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
};