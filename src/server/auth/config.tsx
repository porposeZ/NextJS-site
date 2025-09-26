import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import ResendProvider from "next-auth/providers/resend";
import { db } from "~/server/db";

import { Resend } from "resend";
import { render } from "@react-email/render";
import MagicLinkEmail from "~/emails/MagicLinkEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),

  /* Сессии через БД (модель Session уже есть в T3),
     срок жизни 30 дней, поле updatedAt освежается раз в сутки */
  session: {
    strategy: "database",
    maxAge: 60 * 60 * 24 * 30, // 30 дней
    updateAge: 60 * 60 * 24,   // 1 день
  },

  providers: [
    ResendProvider({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM!,
      // Доп. настройки “магической” ссылки
      // (время жизни токена – 10 минут)
      maxAge: 60 * 10,
      // все е-мейлы приводим к lower-case
      normalizeIdentifier(identifier) {
        return identifier.trim().toLowerCase();
      },

      // Кастомная отправка (наш красивый шаблон)
      async sendVerificationRequest({ identifier, url, provider, request }: any) {
        // ---- Антиспам: простая проверка частоты отправок ----
        try {
          const ip =
            request?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ??
            request?.ip ??
            "local";

          const last = await db.emailRequest.findFirst({
            where: { email: identifier },
            orderBy: { createdAt: "desc" },
          });

          // запрещаем чаще, чем раз в 60 секунд
          if (last && Date.now() - last.createdAt.getTime() < 60_000) {
            throw new Error("TooManyRequests");
          }

          await db.emailRequest.create({
            data: { email: identifier, ip },
          });
        } catch (e) {
          // если это наша ошибка — пробрасываем наверх, чтобы signIn() получил error
          if ((e as Error).message === "TooManyRequests") throw e;
          // любые другие (например, таблицы нет) — не блокируем отправку,
          // просто логируем
          console.warn("[auth] rate-limit check failed:", e);
        }
        // ------------------------------------------------------

        const html = await render(<MagicLinkEmail url={url} />);

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
    // после успешного входа ведём на /orders (если не задан другой callbackUrl)
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        if (u.searchParams.has("callbackUrl")) return u.toString();
        return `${baseUrl}/orders`;
      } catch {
        return `${baseUrl}/orders`;
      }
    },

    async session({ session, user }) {
      return { ...session, user: { ...session.user, id: user.id } };
    },
  },
};