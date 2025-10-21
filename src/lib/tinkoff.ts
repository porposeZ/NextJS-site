// src/lib/tinkoff.ts
let _initPromise: Promise<void> | null = null;

export function loadTinkoffIntegration(terminalKey: string) {
  if (_initPromise) return _initPromise;

  _initPromise = new Promise<void>((resolve, reject) => {
    // если уже загружен
    if (typeof window !== "undefined" && (window as any).PaymentIntegration) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://integrationjs.tbank.ru/integration.js";
    script.async = true;

    script.onload = async () => {
      try {
        const PI = (window as any).PaymentIntegration;
        if (!PI) throw new Error("PaymentIntegration is missing");
        await PI.init({
          terminalKey,
          product: "eacq",
          features: {
            // при необходимости добавим payment, addcardIframe
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
