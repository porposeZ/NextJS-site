import type { NextAuthConfig } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";

import { db } from "~/server/db";
import { env } from "~/server/env";

import { sendMail } from "~/server/email/send";
import MagicLinkEmail from "~/emails/MagicLinkEmail";

const BASE_AUTH_URL = env.NEXTAUTH_URL || env.AUTH_URL;
if (!BASE_AUTH_URL) {
  throw new Error(
    "Configure NEXTAUTH_URL or AUTH_URL (e.g. https://www.yayest.site)"
  );
}
const ALLOWED_HOST = new URL(BASE_AUTH_URL).hostname;

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
      server: process.env.SMTP_URL ?? "smtp://user:pass@localhost:587",
      maxAge: 10 * 60, // 10 минут
      async sendVerificationRequest({ identifier, url }) {
        const parsed = new URL(url);
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
