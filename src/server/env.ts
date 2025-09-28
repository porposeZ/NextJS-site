// central place for env
export const env = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
  EMAIL_FROM: process.env.EMAIL_FROM ?? "",
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  // anti-spam
  MAX_ORDERS_PER_WINDOW: Number(process.env.MAX_ORDERS_PER_WINDOW ?? 3),
  WINDOW_MINUTES: Number(process.env.WINDOW_MINUTES ?? 10),
};
