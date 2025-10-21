// src/lib/tinkoff.ts
declare global {
  interface Window {
    PaymentIntegration?: {
      init(opts: {
        terminalKey: string;
        product: "eacq";
        features?: { iframe?: Record<string, unknown> };
      }): Promise<void>;
    };
  }
}

let _initPromise: Promise<void> | null = null;

export function loadTinkoffIntegration(terminalKey: string) {
  if (_initPromise) return _initPromise;

  _initPromise = new Promise<void>((resolve, reject) => {
    // если уже загружен
    if (typeof window !== "undefined" && window.PaymentIntegration) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://integrationjs.tbank.ru/integration.js";
    script.async = true;

    script.onload = async () => {
      try {
        const PI = window.PaymentIntegration;
        if (!PI) throw new Error("PaymentIntegration is missing");
        await PI.init({
          terminalKey,
          product: "eacq",
          features: {
            iframe: {},
          },
        });
        resolve();
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    };

    script.onerror = () => reject(new Error("integration.js load failed"));
    document.body.appendChild(script);
  });

  return _initPromise;
}
