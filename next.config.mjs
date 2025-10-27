import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  images: {
    // Разрешаем любые локальные пути из /public (и с query-строкой)
    localPatterns: [
      { pathname: "/**" },       // теперь валиден и /about/hero-1.png, и /logo/logo.png?v=1
    ],
  },

  async headers() {
    const isDev = process.env.NODE_ENV !== "production";

    const devSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];


    const prodSecurityHeaders = [
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    return [{ source: "/(.*)", headers: isDev ? devSecurityHeaders : prodSecurityHeaders }];
  },
};

export default config;
