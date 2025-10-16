// app/sitemap.ts
import type { MetadataRoute } from "next";
import { env } from "~/server/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (env.AUTH_URL ?? env.NEXTAUTH_URL ?? "https://www.yayest.site").replace(/\/$/, "");
  const now = new Date().toISOString();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/thanks`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
