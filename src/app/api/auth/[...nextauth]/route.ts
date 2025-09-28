import NextAuth from "next-auth";
import { authConfig } from "~/server/auth/config";

// Prisma требует nodejs-рантайм
export const runtime = "nodejs";

export const { GET, POST } = NextAuth(authConfig).handlers;
