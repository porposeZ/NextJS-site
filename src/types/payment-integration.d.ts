// src/types/payment-integration.d.ts
export {};

declare global {
  interface Window {
    PaymentIntegration?: {
      init(config: {
        terminalKey: string;
        product: "eacq";
        features?: {
          payment?: Record<string, unknown>;
          iframe?: Record<string, unknown>;
          addcardIframe?: Record<string, unknown>;
        };
      }): Promise<void>;
      iframe?: {
        open(opts: Record<string, unknown>): void;
      };
    };
  }
}
