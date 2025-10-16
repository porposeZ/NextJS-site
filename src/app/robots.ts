// app/robots.ts
import type { MetadataRoute } from "next";
import { env } from "~/server/env";

export default function robots(): MetadataRoute.Robots {
  const base = (env.AUTH_URL ?? env.NEXTAUTH_URL ?? "https://www.yayest.site").replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin",
          "/api",
          "/auth",
          "/profile",
          "/orders", // личные данные; список виден только пользователю
          "/_next",
          "/static",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
