import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // базовые
    NEXTAUTH_URL: z.string().url(),
    ADMIN_EMAIL: z.string().email().optional(),
    EMAIL_FROM: z.string().min(1),
    RESEND_API_KEY: z.string().min(1).optional(),

    // лимиты
    MAX_ORDERS_PER_WINDOW: z.coerce.number().default(5),
    WINDOW_MINUTES: z.coerce.number().default(1),

    // база
    DATABASE_URL: z.string().min(1),

    // auth.js
    AUTH_URL: z.string().url().optional(),
    AUTH_TRUST_HOST: z.enum(["true", "false"]).default("false"),
    AUTH_SECRET: z.string().min(1),

    // SMTP (опционально; оставляем для совместимости)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),

    // 🔹 Яндекс.Метрика
    METRIKA_ID: z.string().optional(),                     // например "104653739"
    METRIKA_ENABLED: z.enum(["true", "false"]).optional(), // "true" чтобы включить
  },

  client: {
    // ничего не пробрасываем на клиент, читаем в серверных компонентов/скриптах
  },

  runtimeEnv: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    EMAIL_FROM: process.env.EMAIL_FROM,
    RESEND_API_KEY: process.env.RESEND_API_KEY,

    MAX_ORDERS_PER_WINDOW: process.env.MAX_ORDERS_PER_WINDOW,
    WINDOW_MINUTES: process.env.WINDOW_MINUTES,

    DATABASE_URL: process.env.DATABASE_URL,

    AUTH_URL: process.env.AUTH_URL,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    AUTH_SECRET: process.env.AUTH_SECRET,

    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,

    // Метрика
    METRIKA_ID: process.env.METRIKA_ID,
    METRIKA_ENABLED: process.env.METRIKA_ENABLED,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
