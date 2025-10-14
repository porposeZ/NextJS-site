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
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // ⬇⬇⬇ добавили 'unsafe-inline'
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      // добавил wss: на всякий случай для HMR в некоторых окружениях
      "connect-src 'self' ws: wss: http://localhost:* http://127.0.0.1:* https://api.resend.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
  },
];


    const prodSecurityHeaders = [
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://api.resend.com",
          "frame-ancestors 'none'",
          "form-action 'self'",
          "base-uri 'self'",
          "upgrade-insecure-requests",
        ].join("; "),
      },
    ];

    return [{ source: "/(.*)", headers: isDev ? devSecurityHeaders : prodSecurityHeaders }];
  },
};

export default config;
