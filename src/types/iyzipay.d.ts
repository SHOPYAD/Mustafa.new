declare module "iyzipay" {
  type IyzipayCallback = (err: Error | null, result: Record<string, unknown>) => void;

  class Iyzipay {
    constructor(opts: { apiKey: string; secretKey: string; uri?: string });
    checkoutFormInitialize: {
      create: (request: Record<string, unknown>, cb: IyzipayCallback) => void;
    };
    checkoutForm: {
      retrieve: (request: Record<string, unknown>, cb: IyzipayCallback) => void;
    };
    static LOCALE: { TR: string; EN: string };
    static CURRENCY: { TRY: string; USD: string; EUR: string; GBP: string };
    static PAYMENT_GROUP: { PRODUCT: string; LISTING: string };
    static BASKET_ITEM_TYPE: { PHYSICAL: string; VIRTUAL: string };
  }

  export = Iyzipay;
}
