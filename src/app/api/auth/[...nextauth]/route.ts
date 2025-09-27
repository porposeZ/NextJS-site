import NextAuth from "next-auth";
import { authConfig } from "~/server/auth/config";

// 👇 важно: запрещаем edge, только nodejs
export const runtime = "nodejs";

const { handlers } = NextAuth(authConfig);
export const { GET, POST } = handlers;