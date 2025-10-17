// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import Script from "next/script";
import { auth } from "~/server/auth";
import { env } from "~/server/env";
import { Button } from "~/components/ui/button";
import ConsentAttach from "~/components/ConsentAttach";
import SignOutButton from "~/components/SignOutButton";
import Footer from "~/components/Footer";
import "../styles/globals.css";

const siteUrl = (env.AUTH_URL ?? env.NEXTAUTH_URL ?? "https://www.yayest.site").replace(/\/$/, "");
const siteName = "Я есть";
const siteTitle =
  "Свой человек в другом городе | Выполним задачи для физических и юридических лиц";
const siteDescription =
  "Каждый помощник проходит отбор: анкета, репутация, реальные задания. Оставляем только надёжных. Гарантия и скорость. Назначаем менеджера, контролируем сроки и качество.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: "%s — Я есть" },
  description: siteDescription,
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [{ url: "/logo/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/logo/logo.png"],
  },
  icons: {
    icon: "/logo/logo.png",
    shortcut: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
};

// themeColor должен быть в viewport, а не в metadata
export const viewport: Viewport = { themeColor: "#0ea5e9" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  const metrikaId = env.METRIKA_ID;
  const metrikaOn = (env.METRIKA_ENABLED ?? "true") !== "false" && !!metrikaId;

  // Включаем T-Bank только если есть ключ терминала
  const tinkoffOn = !!env.TINKOFF_TERMINAL_KEY;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#org`,
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/logo/logo.png`,
        contactPoint: [
          { "@type": "ContactPoint", telephone: "+7-391-216-25-84", contactType: "customer service", areaServed: "RU" },
          { "@type": "ContactPoint", telephone: "+7-923-311-88-58", contactType: "customer service", areaServed: "RU" },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: siteName,
        publisher: { "@id": `${siteUrl}#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="ru">
      <head nonce={nonce}>
        {/* JSON-LD */}
        <Script
          id="jsonld-base"
          type="application/ld+json"
          nonce={nonce}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Yandex.Metrika */}
        {metrikaOn && (
          <Script
            id="ym-loader"
            strategy="afterInteractive"
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `
                (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {
                    if (document.scripts[j].src === r) { return; }
                  }
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0];
                  k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
                })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

                ym(${metrikaId}, 'init', {
                  ssr: true,
                  webvisor: true,
                  clickmap: true,
                  ecommerce: "dataLayer",
                  accurateTrackBounce: true,
                  trackLinks: true
                });
              `,
            }}
          />
        )}

        {/* T-Bank loader: без onLoad, всё строкой */}
        {tinkoffOn && (
          <Script
            id="tbank-loader"
            strategy="afterInteractive"
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `
                (function(){
                  try{
                    if (window.__tbank_inited) return;
                    window.__tbank_inited = true;

                    // Подключаем integration.js
                    var s = document.createElement('script');
                    s.src = 'https://integrationjs.tbank.ru/integration.js';
                    s.async = true;
                    (document.head || document.body).appendChild(s);

                    // Ждём доступности PaymentIntegration и инициализируем
                    function boot(){
                      if (!window.PaymentIntegration) { setTimeout(boot, 150); return; }
                      try {
                        window.PaymentIntegration.init({
                          terminalKey: '${env.TINKOFF_TERMINAL_KEY}',
                          product: 'eacq',
                          features: { iframe: {} }
                        });
                      } catch(e){ console.warn('[tbank] init error:', e); }
                    }
                    boot();
                  } catch(e){ console.warn('[tbank] loader error:', e); }
                })();
              `,
            }}
          />
        )}
      </head>

      <body className="min-h-dvh flex flex-col bg-slate-50 text-slate-900 antialiased">
        {/* noscript-пиксель Метрики */}
        {metrikaOn && (
          <noscript>
            <div>
              <img
                src={`https://mc.yandex.ru/watch/${metrikaId}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        )}

        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <nav className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo/logo.png?v=1"
                alt="Я есть"
                width={360}
                height={120}
                priority
                className="h-16 w-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/orders" className="text-sm hover:text-sky-700">Мои заказы</Link>
              <Link href="/about" className="text-sm hover:text-sky-700">О нас</Link>
              <Link href="/profile" className="text-sm hover:text-sky-700">Личный кабинет</Link>

              {session?.user?.id ? (
                <>
                  <span className="hidden text-xs text-slate-500 md:inline">{session.user.email}</span>
                  <SignOutButton />
                </>
              ) : (
                <Link href="/auth/signin">
                  <Button size="sm" className="bg-orange-500 transition-colors hover:bg-orange-600">
                    Войти
                  </Button>
                </Link>
              )}
            </div>

            {/* Контакты справа */}
            <div className="absolute top-1/2 right-[-180px] flex -translate-y-1/2 flex-col items-start gap-1 text-xs leading-tight text-slate-700">
              <ul className="space-y-1.5">
                <li>
                  <a href="mailto:info@yayestcorp.ru" className="group flex items-center gap-2 font-medium text-slate-800 transition-colors hover:text-sky-700">
                    <MailIcon className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
                    <span>info@yayestcorp.ru</span>
                  </a>
                </li>
                <li>
                  <a href="tel:3912162584" className="group flex items-center gap-2 font-medium text-slate-800 transition-colors hover:text-sky-700">
                    <PhoneIcon className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
                    <span>+7 391 216-25-84</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+79233118858" className="group flex items-center gap-2 font-medium text-slate-800 transition-colors hover:text-sky-700">
                    <PhoneIcon className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
                    <span>+7 923 311-88-58</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </header>

        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10">{children}</main>

        {/* Плавающие соц-кнопки */}
        <div className="fixed right-5 bottom-5 z-40 flex flex-col gap-3">
          <a
            aria-label="WhatsApp"
            href="https://wa.me/message/35FOTDGQOVZ4O1"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-500 p-3 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-green-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20 3.5A10.5 10.5 0 0 0 3.6 19.2L3 22l2.9-.6A10.5 10.5 0 1 0 20 3.5ZM12 20.5a8.5 8.5 0 1 1 7.1-13.1 8.5 8.5 0 0 1-7.1 13.1Zm4-6.3c-.2-.1-1.2-.6-1.4-.7s-.3-.1-.5.1-.6.7-.7.8-.3.1-.5 0a6.7 6.7 0 0 1-2-1.3 7.4 7.4 0 0 1-1.4-1.8c-.1-.2 0-.3 0-.5l.3-.4.2-.4c.1-.1 0-.3 0-.4л-.6-1.4c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.2-.5.4a2 2 0 0 0-.6 1.6 4 4 0 0 0 .8 2.1 9.7 9.7 0 0 0 3.7 3.6c.4.2 1 .5 1.6.6a3 3 0 0 0 1.4.1 2.2 2.2 0 0 0 1.4-1c.2-.4.2-.8.2-.9 0-.1-.2-.2-.4-.3Z" />
            </svg>
          </a>
          <a
            aria-label="Telegram"
            href="https://t.me/yayestMG"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-sky-500 p-3 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9.5 14.1 9.3 18c.4 0 .6-.2.8-.4л1.9-1.8 4 3c.7.4 1.2.2 1.4-.7л2.5-11c.3-1.2-.4-1.7-1.2-1.4L3.7 9c-1 .4-1 1 .2 1.4л4.5 1.4 10.4-6.6-9.3 8.9Z" />
            </svg>
          </a>
        </div>

        <ConsentAttach />
        <Footer />
      </body>
    </html>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M5 7h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm0 0 7 5 7-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13.5l4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
