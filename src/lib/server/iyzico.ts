/**
 * Official iyzico Checkout Form wrapper (docs fetched 28 Aug 2026).
 *
 * 3DS: Do NOT call threedsInitialize / threedsPayment. Official CF-Initialize
 * hosts card entry, installment, BIN checks, and 3-D Secure on iyzico's page.
 * https://docs.iyzico.com/en/payment-methods/checkoutform/cf-implementation/cf-initialize
 *
 * BIN / installment APIs: skipped — CF already handles cards on the hosted page.
 * Marketplace / Pay with iyzico / Subscription: not used (PRODUCT + VIRTUAL hotel item).
 */
import { createHmac, timingSafeEqual } from "crypto";
import { createRequire } from "module";
import {
  getIyzicoMerchantUrls,
  getIyzicoSecrets,
  normalizeIyzicoCredential,
  type IyzicoMode,
} from "@/lib/server/payments-settings";
import {
  getSpotRate,
  isOfficialIyzicoCurrency,
  type IyzicoCurrency,
  type SpotRate,
} from "@/lib/server/iyzico-fx";
import {
  mapGuestCheckoutError,
  SANDBOX_AMOUNT_LIMIT_ERROR,
  sandboxConvertedAmountBlocked,
} from "@/lib/iyzico-limits";

const require = createRequire(import.meta.url);
const Iyzipay = require("iyzipay") as typeof import("iyzipay");

type SdkCallback = (err: Error | null, result: Record<string, unknown>) => void;
type SdkMethod = { create: (req: object, cb: SdkCallback) => void; retrieve: (req: object, cb: SdkCallback) => void };
type IyzipayClient = {
  checkoutFormInitialize: SdkMethod;
  checkoutForm: SdkMethod;
  payment: SdkMethod;
  refund: SdkMethod;
  cancel: SdkMethod;
  binNumber: SdkMethod;
};

/** Official sandbox dummy for non-TR buyers. Never send this in production. */
export const IYZICO_SANDBOX_DUMMY_IDENTITY = "11111111111";

export type IyzicoBuyer = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  identityNumber?: string;
  city?: string;
  country?: string;
  address?: string;
  ip?: string;
};

export type IyzicoChargePlan = {
  displayAmount: number;
  displayCurrency: string;
  chargedAmount: number;
  chargedCurrency: IyzicoCurrency;
  fxRate: number;
  fxSource: string;
  fxAt: string;
  fxNote: string;
};

export type IyzicoCheckoutInput = {
  bookingId: string;
  conversationId: string;
  price: number;
  currency: string;
  hotelName: string;
  roomName: string;
  callbackUrl: string;
  buyer: IyzicoBuyer;
};

export type IyzicoCheckoutResult = {
  ok: boolean;
  token?: string;
  paymentPageUrl?: string;
  checkoutFormContent?: string;
  charge?: IyzicoChargePlan;
  error?: string;
  errorCode?: string;
};

export type IyzicoProbeResult = {
  ok: boolean;
  mode: IyzicoMode;
  baseUrl: string;
  latencyMs: number;
  currencyNote: string;
  via?: "bin" | "checkout_initialize";
  hintCode?: "invalid_signature";
  error?: string;
  errorCode?: string;
};

export type IyzicoProbeInput = {
  apiKey?: string;
  secretKey?: string;
};

export type IyzicoRetrieveResult = {
  ok: boolean;
  paid: boolean;
  /** fraudStatus === 0 — official: wait for merchant webhook SUCCESS, do not fulfill. */
  pendingReview: boolean;
  paymentStatus?: string;
  paymentId?: string;
  paymentTransactionId?: string;
  conversationId?: string;
  basketId?: string;
  price?: string;
  paidPrice?: string;
  currency?: string;
  token?: string;
  fraudStatus?: number;
  amountMatched?: boolean;
  /** null when retrieve response had no signature field. */
  signatureValid: boolean | null;
  error?: string;
};

export type IyzicoRefundResult = {
  ok: boolean;
  via: "cancel" | "refund";
  paymentId?: string;
  paymentTransactionId?: string;
  refundId?: string;
  price?: string;
  currency?: string;
  error?: string;
};

export type IyzicoWebhookBody = {
  token?: string;
  status?: string;
  paymentId?: string;
  iyziPaymentId?: string | number;
  paymentConversationId?: string;
  iyziEventType?: string;
  iyziEventTime?: string | number;
  iyziReferenceCode?: string;
  merchantId?: string;
};

function money(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function currencyConst(code: string): string {
  const table = Iyzipay.CURRENCY as Record<string, string>;
  return table[code] || Iyzipay.CURRENCY.TRY;
}

function splitName(full: string): { name: string; surname: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { name: parts[0] || "Guest", surname: "Guest" };
  return { name: parts[0], surname: parts.slice(1).join(" ") };
}

export function isValidTcKimlik(value: string): boolean {
  if (!/^[1-9]\d{10}$/.test(value)) return false;
  const d = value.split("").map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const digit10 = ((odd * 7) - even) % 10;
  const digit11 = d.slice(0, 10).reduce((sum, n) => sum + n, 0) % 10;
  return d[9] === digit10 && d[10] === digit11;
}

export function buyerLooksTurkish(buyer: IyzicoBuyer): boolean {
  const country = String(buyer.country || "").trim().toLowerCase();
  if (country === "tr" || country === "turkey" || country === "türkiye" || country === "turkiye") {
    return true;
  }
  const phone = String(buyer.phone || "").replace(/[^\d+]/g, "");
  return phone.startsWith("+90") || phone.startsWith("90");
}

export function resolveIyzicoIdentity(
  buyer: IyzicoBuyer,
  mode: IyzicoMode
): { ok: true; identityNumber: string } | { ok: false; error: string } {
  const raw = String(buyer.identityNumber || "").trim();
  const turkish = buyerLooksTurkish(buyer);

  if (turkish) {
    const digits = raw.replace(/\D/g, "");
    if (isValidTcKimlik(digits)) return { ok: true, identityNumber: digits };
    if (mode === "sandbox") return { ok: true, identityNumber: IYZICO_SANDBOX_DUMMY_IDENTITY };
    return { ok: false, error: "identity_tc_required" };
  }

  if (mode === "sandbox") {
    return { ok: true, identityNumber: IYZICO_SANDBOX_DUMMY_IDENTITY };
  }

  if (raw.length >= 5) return { ok: true, identityNumber: raw.slice(0, 32) };
  return { ok: false, error: "identity_required" };
}

/**
 * Sandbox merchant (confirmed): TRY only, iyzico FX rate = 0.
 * Production: official set TRY|USD|EUR|GBP|NOK|CHF as-is.
 */
export async function planIyzicoCharge(
  amount: number,
  currency: string,
  mode: IyzicoMode
): Promise<IyzicoChargePlan> {
  const displayCurrency = (currency || "USD").toUpperCase();
  const displayAmount = Number(amount);
  if (!Number.isFinite(displayAmount) || displayAmount <= 0) {
    throw new Error("invalid_amount");
  }

  if (mode !== "sandbox" && isOfficialIyzicoCurrency(displayCurrency)) {
    return {
      displayAmount,
      displayCurrency,
      chargedAmount: displayAmount,
      chargedCurrency: displayCurrency,
      fxRate: 1,
      fxSource: "identity",
      fxAt: new Date().toISOString(),
      fxNote: "",
    };
  }

  if (displayCurrency === "TRY") {
    return {
      displayAmount,
      displayCurrency: "TRY",
      chargedAmount: displayAmount,
      chargedCurrency: "TRY",
      fxRate: 1,
      fxSource: "identity",
      fxAt: new Date().toISOString(),
      fxNote: mode === "sandbox" ? "Sandbox charges TRY (merchant panel: TRY only)." : "",
    };
  }

  const spot: SpotRate = await getSpotRate(displayCurrency, "TRY");
  const chargedAmount = Math.round(displayAmount * spot.rate * 100) / 100;
  const fxNote =
    mode === "sandbox"
      ? `Sandbox merchant accepts TRY only (iyzico FX=0). ${displayAmount} ${displayCurrency} → ${chargedAmount} TRY at ${spot.rate} via ${spot.source}.`
      : `${displayCurrency} is not in official iyzico currencies. Charged TRY at ${spot.rate} via ${spot.source}.`;
  return {
    displayAmount,
    displayCurrency,
    chargedAmount,
    chargedCurrency: "TRY",
    fxRate: spot.rate,
    fxSource: spot.source,
    fxAt: spot.at,
    fxNote,
  };
}

export function paidPriceMatchesCharged(paidPrice: unknown, chargedAmount: unknown): boolean {
  const paid = Number(paidPrice);
  const charged = Number(chargedAmount);
  if (!Number.isFinite(charged) || charged <= 0) return true;
  if (!Number.isFinite(paid) || paid <= 0) return false;
  const tolerance = Math.max(0.5, charged * 0.02);
  return Math.abs(paid - charged) <= tolerance;
}

const PROXY_ENV_KEYS = [
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "http_proxy",
  "https_proxy",
  "ALL_PROXY",
  "all_proxy",
  "SOCKS_PROXY",
  "SOCKS5_PROXY",
  "socks_proxy",
  "socks5_proxy",
] as const;

/** iyzipay uses the legacy `request` client, which follows a dead local proxy and 500s. */
async function withDirectIyzicoNetwork<T>(fn: () => Promise<T>): Promise<T> {
  const saved: Partial<Record<(typeof PROXY_ENV_KEYS)[number], string | undefined>> = {};
  for (const key of PROXY_ENV_KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  const prevNoProxy = process.env.NO_PROXY;
  const prevNoProxyLc = process.env.no_proxy;
  process.env.NO_PROXY = "*";
  process.env.no_proxy = "*";
  try {
    return await fn();
  } finally {
    for (const key of PROXY_ENV_KEYS) {
      if (saved[key] == null) delete process.env[key];
      else process.env[key] = saved[key];
    }
    if (prevNoProxy == null) delete process.env.NO_PROXY;
    else process.env.NO_PROXY = prevNoProxy;
    if (prevNoProxyLc == null) delete process.env.no_proxy;
    else process.env.no_proxy = prevNoProxyLc;
  }
}

export function mapIyzicoTransportError(err: unknown): string {
  const raw = err instanceof Error ? `${err.message} ${err.cause || ""}` : String(err || "");
  if (/tunnel|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|socket/i.test(raw)) {
    return "iyzico_network";
  }
  const clean = raw.replace(/sand_[a-z0-9]+|live_[a-z0-9]+/gi, "[key]").slice(0, 180);
  return clean || "iyzico_init_failed";
}

function iyzicoKeyKind(value: string): "sandbox" | "live" | "opaque" | "empty" {
  if (!value) return "empty";
  if (/^sandbox[-_]/i.test(value)) return "sandbox";
  if (/^live[-_]/i.test(value)) return "live";
  return "opaque";
}

function isInvalidSignatureError(error?: string, errorCode?: string): boolean {
  const code = String(errorCode || "").trim();
  const message = String(error || "").trim().toLowerCase();
  return code === "1000" || message.includes("invalid signature");
}

async function client(): Promise<{ sdk: IyzipayClient; mode: IyzicoMode; baseUrl: string } | null> {
  const secrets = await getIyzicoSecrets();
  if (!secrets.enabled || !secrets.apiKey || !secrets.secretKey) return null;
  return {
    mode: secrets.mode,
    baseUrl: secrets.baseUrl,
    sdk: new Iyzipay({
      apiKey: secrets.apiKey,
      secretKey: secrets.secretKey,
      uri: secrets.baseUrl,
    }) as unknown as IyzipayClient,
  };
}

async function probeClient(input?: IyzicoProbeInput): Promise<{
  sdk: IyzipayClient;
  mode: IyzicoMode;
  baseUrl: string;
  apiKey: string;
  secretKey: string;
} | null> {
  const secrets = await getIyzicoSecrets();
  const apiKey = normalizeIyzicoCredential(input?.apiKey || "") || secrets.apiKey;
  const secretKey = normalizeIyzicoCredential(input?.secretKey || "") || secrets.secretKey;
  if (!apiKey || !secretKey) return null;
  return {
    mode: secrets.mode,
    baseUrl: secrets.baseUrl,
    apiKey,
    secretKey,
    sdk: new Iyzipay({
      apiKey,
      secretKey,
      uri: secrets.baseUrl,
    }) as unknown as IyzipayClient,
  };
}

function asPromise<T>(fn: (cb: (err: Error | null, result: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

function firstPaymentTransactionId(result: Record<string, unknown>): string {
  const items = result.itemTransactions;
  if (!Array.isArray(items) || items.length === 0) return "";
  const first = items[0] as Record<string, unknown>;
  return first.paymentTransactionId != null ? String(first.paymentTransactionId) : "";
}

function parseFraudStatus(raw: unknown): number | undefined {
  if (raw === 0 || raw === 1 || raw === -1 || raw === "0" || raw === "1" || raw === "-1") {
    return Number(raw);
  }
  return undefined;
}

function mapPaymentResult(
  result: Record<string, unknown>,
  extras: { token?: string; conversationId?: string; chargedAmount?: number }
): IyzicoRetrieveResult {
  const apiOk = String(result.status || "").toLowerCase() === "success";
  const paymentStatus = String(result.paymentStatus || "");
  const paymentOk =
    paymentStatus.toLowerCase() === "success" || paymentStatus.toLowerCase() === "paid";
  const fraudStatus = parseFraudStatus(result.fraudStatus);
  const pendingReview = paymentOk && fraudStatus === 0;
  const rejected = fraudStatus === -1;
  const amountMatched = paidPriceMatchesCharged(result.paidPrice, extras.chargedAmount);
  return {
    ok: apiOk,
    paid: false,
    pendingReview,
    paymentStatus,
    paymentId: result.paymentId != null ? String(result.paymentId) : "",
    paymentTransactionId: firstPaymentTransactionId(result),
    conversationId:
      result.conversationId != null ? String(result.conversationId) : extras.conversationId || "",
    basketId: result.basketId != null ? String(result.basketId) : "",
    price: result.price != null ? String(result.price) : "",
    paidPrice: result.paidPrice != null ? String(result.paidPrice) : "",
    currency: result.currency != null ? String(result.currency) : "",
    token: result.token != null ? String(result.token) : extras.token || "",
    fraudStatus,
    amountMatched,
    signatureValid: null,
    error: apiOk ? undefined : String(result.errorMessage || result.errorCode || paymentStatus || ""),
  };
}

function finalizeRetrieve(
  mapped: IyzicoRetrieveResult,
  signatureValid: boolean | null
): IyzicoRetrieveResult {
  const rejected = mapped.fraudStatus === -1;
  const paid =
    mapped.ok &&
    (String(mapped.paymentStatus || "").toLowerCase() === "success" ||
      String(mapped.paymentStatus || "").toLowerCase() === "paid") &&
    !mapped.pendingReview &&
    !rejected &&
    signatureValid !== false &&
    mapped.amountMatched !== false;
  return {
    ...mapped,
    paid,
    signatureValid,
    error: paid ? undefined : mapped.error || mapped.paymentStatus || "",
  };
}

export async function createCheckout(input: IyzicoCheckoutInput): Promise<IyzicoCheckoutResult> {
  const boxed = await client();
  if (!boxed) return { ok: false, error: "iyzico_not_configured" };

  let charge: IyzicoChargePlan;
  try {
    charge = await planIyzicoCharge(input.price, input.currency, boxed.mode);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    return { ok: false, error: msg === "invalid_amount" ? "invalid_amount" : "fx_unavailable" };
  }

  if (sandboxConvertedAmountBlocked(charge.chargedAmount, boxed.mode)) {
    return { ok: false, charge, error: SANDBOX_AMOUNT_LIMIT_ERROR };
  }

  const identity = resolveIyzicoIdentity(input.buyer, boxed.mode);
  if (!identity.ok) return { ok: false, error: identity.error };

  const { name, surname } = splitName(`${input.buyer.name} ${input.buyer.surname}`.trim());
  const price = money(charge.chargedAmount);
  const phone = input.buyer.phone.replace(/[^\d+]/g, "") || "+905350000000";
  const turkish = buyerLooksTurkish(input.buyer);
  const address = input.buyer.address || (turkish ? "Istanbul, Turkey" : "Address");
  const city = input.buyer.city || (turkish ? "Istanbul" : "City");
  const country = input.buyer.country || (turkish ? "Turkey" : "International");
  const request = {
    locale: Iyzipay.LOCALE.EN,
    conversationId: input.conversationId,
    price,
    paidPrice: price,
    currency: currencyConst(charge.chargedCurrency),
    basketId: input.bookingId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: input.callbackUrl,
    enabledInstallments: [1],
    buyer: {
      id: input.buyer.id.slice(0, 32) || "guest",
      name,
      surname,
      gsmNumber: phone.startsWith("+") ? phone : `+${phone}`,
      email: input.buyer.email,
      identityNumber: identity.identityNumber,
      registrationAddress: address,
      ip: input.buyer.ip || "85.34.78.112",
      city,
      country,
    },
    shippingAddress: {
      contactName: `${name} ${surname}`,
      city,
      country,
      address,
    },
    billingAddress: {
      contactName: `${name} ${surname}`,
      city,
      country,
      address,
    },
    basketItems: [
      {
        id: input.bookingId,
        name: `${input.hotelName} — ${input.roomName}`.slice(0, 180),
        category1: "Hotels",
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price,
      },
    ],
  };

  let result: Record<string, unknown>;
  try {
    result = await withDirectIyzicoNetwork(() =>
      asPromise<Record<string, unknown>>((cb) => boxed.sdk.checkoutFormInitialize.create(request, cb))
    );
  } catch (err) {
    return { ok: false, charge, error: mapIyzicoTransportError(err) };
  }
  if (String(result.status || "") !== "success") {
    const code = result.errorCode != null ? String(result.errorCode) : "";
    const message = String(result.errorMessage || "").trim();
    return {
      ok: false,
      charge,
      error: mapGuestCheckoutError(message, code),
      errorCode: code || undefined,
    };
  }
  return {
    ok: true,
    token: String(result.token || ""),
    paymentPageUrl: String(result.paymentPageUrl || result.payWithIyzicoPageUrl || ""),
    checkoutFormContent: String(result.checkoutFormContent || ""),
    charge,
  };
}

function sdkFailure(result: Record<string, unknown>): { error: string; errorCode?: string } {
  const errorCode = result.errorCode != null ? String(result.errorCode) : undefined;
  return {
    error: String(result.errorMessage || result.errorCode || "iyzico_probe_failed"),
    errorCode,
  };
}

async function probeViaBin(sdk: IyzipayClient): Promise<{ ok: boolean; error?: string; errorCode?: string }> {
  const result = await asPromise<Record<string, unknown>>((cb) =>
    sdk.binNumber.retrieve(
      {
        locale: Iyzipay.LOCALE.TR,
        conversationId: "123456789",
        binNumber: "554960",
      },
      cb
    )
  );
  if (String(result.status || "") === "success") return { ok: true };
  return { ok: false, ...sdkFailure(result) };
}

/** 1.00 TRY Checkout Form initialize — no guest charge; session expires unused. */
async function probeViaCheckoutInitialize(
  sdk: IyzipayClient
): Promise<{ ok: boolean; error?: string; errorCode?: string }> {
  const conversationId = `probe-init-${Date.now()}`;
  const { callbackUrl } = await getIyzicoMerchantUrls();
  const result = await asPromise<Record<string, unknown>>((cb) =>
    sdk.checkoutFormInitialize.create(
      {
        locale: Iyzipay.LOCALE.EN,
        conversationId,
        price: "1.0",
        paidPrice: "1.0",
        currency: Iyzipay.CURRENCY.TRY,
        basketId: conversationId,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl,
        enabledInstallments: [1],
        buyer: {
          id: "probe",
          name: "Probe",
          surname: "Test",
          gsmNumber: "+905350000000",
          email: "probe@lonaliza.com",
          identityNumber: IYZICO_SANDBOX_DUMMY_IDENTITY,
          registrationAddress: "Istanbul, Turkey",
          ip: "85.34.78.112",
          city: "Istanbul",
          country: "Turkey",
        },
        shippingAddress: {
          contactName: "Probe Test",
          city: "Istanbul",
          country: "Turkey",
          address: "Istanbul, Turkey",
        },
        billingAddress: {
          contactName: "Probe Test",
          city: "Istanbul",
          country: "Turkey",
          address: "Istanbul, Turkey",
        },
        basketItems: [
          {
            id: "probe",
            name: "Connection probe",
            category1: "Hotels",
            itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
            price: "1.0",
          },
        ],
      },
      cb
    )
  );
  if (String(result.status || "") === "success") return { ok: true };
  return { ok: false, ...sdkFailure(result) };
}

function logIyzicoProbe(payload: Record<string, unknown>) {
  console.info("[iyzico-probe]", JSON.stringify(payload));
}

/**
 * Verifies merchant keys. Official BIN first (no charge).
 * `/payment/test` is not used — it succeeds even with a wrong secret.
 * If BIN returns Invalid signature, fall back to a 1 TRY Checkout Form initialize.
 */
export async function probeIyzicoConnection(input?: IyzicoProbeInput): Promise<IyzicoProbeResult> {
  const started = Date.now();
  const boxed = await probeClient(input);
  if (!boxed) {
    return {
      ok: false,
      mode: "sandbox",
      baseUrl: "",
      latencyMs: Date.now() - started,
      currencyNote: "",
      error: "iyzico_not_configured",
    };
  }
  const currencyNote =
    boxed.mode === "sandbox"
      ? "Sandbox accepts TRY only"
      : "Production: TRY, USD, EUR, GBP, NOK, CHF";
  const meta = {
    mode: boxed.mode,
    baseUrl: boxed.baseUrl,
    apiKeyChars: boxed.apiKey.length,
    secretChars: boxed.secretKey.length,
    apiKeyKind: iyzicoKeyKind(boxed.apiKey),
    secretKind: iyzicoKeyKind(boxed.secretKey),
  };

  try {
    const outcome = await withDirectIyzicoNetwork(async () => {
      const bin = await probeViaBin(boxed.sdk);
      if (bin.ok) return { via: "bin" as const, ok: true as const };
      if (!isInvalidSignatureError(bin.error, bin.errorCode)) {
        return { via: "bin" as const, ok: false as const, error: bin.error, errorCode: bin.errorCode };
      }
      const init = await probeViaCheckoutInitialize(boxed.sdk);
      if (init.ok) return { via: "checkout_initialize" as const, ok: true as const };
      return {
        via: "checkout_initialize" as const,
        ok: false as const,
        error: init.error || bin.error,
        errorCode: init.errorCode || bin.errorCode,
      };
    });
    const latencyMs = Date.now() - started;
    const hintCode = !outcome.ok && isInvalidSignatureError(outcome.error, outcome.errorCode)
      ? "invalid_signature"
      : undefined;
    logIyzicoProbe({
      ...meta,
      ok: outcome.ok,
      via: outcome.via,
      latencyMs,
      errorCode: outcome.ok ? undefined : outcome.errorCode,
      hintCode,
    });
    if (!outcome.ok) {
      return {
        ok: false,
        mode: boxed.mode,
        baseUrl: boxed.baseUrl,
        latencyMs,
        currencyNote,
        via: outcome.via,
        hintCode,
        error: outcome.error,
        errorCode: outcome.errorCode,
      };
    }
    return {
      ok: true,
      mode: boxed.mode,
      baseUrl: boxed.baseUrl,
      latencyMs,
      currencyNote,
      via: outcome.via,
    };
  } catch (err) {
    const latencyMs = Date.now() - started;
    const error = mapIyzicoTransportError(err);
    logIyzicoProbe({ ...meta, ok: false, latencyMs, error: error === "iyzico_network" ? "network" : "transport" });
    return {
      ok: false,
      mode: boxed.mode,
      baseUrl: boxed.baseUrl,
      latencyMs,
      currencyNote,
      error,
    };
  }
}

function emptyRetrieve(error: string): IyzicoRetrieveResult {
  return { ok: false, paid: false, pendingReview: false, signatureValid: null, error };
}

export async function retrieveCheckout(
  token: string,
  conversationId?: string,
  chargedAmount?: number
): Promise<IyzicoRetrieveResult> {
  const boxed = await client();
  if (!boxed) return emptyRetrieve("iyzico_not_configured");
  const secrets = await getIyzicoSecrets();
  let result: Record<string, unknown>;
  try {
    result = await withDirectIyzicoNetwork(() =>
      asPromise<Record<string, unknown>>((cb) =>
        boxed.sdk.checkoutForm.retrieve(
          {
            locale: Iyzipay.LOCALE.EN,
            conversationId: conversationId || token,
            token,
          },
          cb
        )
      )
    );
  } catch (err) {
    return emptyRetrieve(mapIyzicoTransportError(err));
  }
  const mapped = mapPaymentResult(result, { token, conversationId, chargedAmount });
  const signature = String(result.signature || "").trim();
  const signatureValid = signature ? verifyCheckoutRetrieveSignature(result, secrets.secretKey) : null;
  return finalizeRetrieve(mapped, signatureValid);
}

/** Official /payment/detail — payment.retrieve by paymentId. */
export async function retrievePayment(
  paymentId: string,
  conversationId?: string,
  chargedAmount?: number
): Promise<IyzicoRetrieveResult> {
  const boxed = await client();
  if (!boxed) return emptyRetrieve("iyzico_not_configured");
  const secrets = await getIyzicoSecrets();
  const result = await asPromise<Record<string, unknown>>((cb) =>
    boxed.sdk.payment.retrieve(
      {
        locale: Iyzipay.LOCALE.EN,
        conversationId: conversationId || paymentId,
        paymentId,
        paymentConversationId: conversationId || "",
      },
      cb
    )
  );
  const mapped = mapPaymentResult(result, { conversationId, chargedAmount });
  const signature = String(result.signature || "").trim();
  const signatureValid = signature ? verifyPaymentRetrieveSignature(result, secrets.secretKey) : null;
  return finalizeRetrieve(mapped, signatureValid);
}

/** Official /payment/refund — refund.create (per paymentTransactionId). */
export async function refundPayment(input: {
  paymentTransactionId: string;
  price: number;
  currency: string;
  conversationId?: string;
  ip?: string;
}): Promise<IyzicoRefundResult> {
  const boxed = await client();
  if (!boxed) return { ok: false, via: "refund", error: "iyzico_not_configured" };
  const currency = input.currency.toUpperCase();
  const result = await asPromise<Record<string, unknown>>((cb) =>
    boxed.sdk.refund.create(
      {
        locale: Iyzipay.LOCALE.EN,
        conversationId: input.conversationId || input.paymentTransactionId,
        paymentTransactionId: input.paymentTransactionId,
        price: money(input.price),
        currency: currencyConst(isOfficialIyzicoCurrency(currency) ? currency : "TRY"),
        ip: input.ip || "85.34.78.112",
      },
      cb
    )
  );
  if (String(result.status || "") !== "success") {
    return {
      ok: false,
      via: "refund",
      paymentTransactionId: input.paymentTransactionId,
      error: String(result.errorMessage || result.errorCode || "refund_failed"),
    };
  }
  return {
    ok: true,
    via: "refund",
    paymentId: result.paymentId != null ? String(result.paymentId) : "",
    paymentTransactionId:
      result.paymentTransactionId != null
        ? String(result.paymentTransactionId)
        : input.paymentTransactionId,
    refundId:
      result.paymentTransactionId != null
        ? String(result.paymentTransactionId)
        : String(result.paymentId || ""),
    price: result.price != null ? String(result.price) : money(input.price),
    currency: result.currency != null ? String(result.currency) : currency,
  };
}

/** Official /payment/cancel — same calendar day, full amount only. */
export async function cancelPayment(input: {
  paymentId: string;
  conversationId?: string;
  ip?: string;
}): Promise<IyzicoRefundResult> {
  const boxed = await client();
  if (!boxed) return { ok: false, via: "cancel", error: "iyzico_not_configured" };
  const result = await asPromise<Record<string, unknown>>((cb) =>
    boxed.sdk.cancel.create(
      {
        locale: Iyzipay.LOCALE.EN,
        conversationId: input.conversationId || input.paymentId,
        paymentId: input.paymentId,
        ip: input.ip || "85.34.78.112",
      },
      cb
    )
  );
  if (String(result.status || "") !== "success") {
    return {
      ok: false,
      via: "cancel",
      paymentId: input.paymentId,
      error: String(result.errorMessage || result.errorCode || "cancel_failed"),
    };
  }
  return {
    ok: true,
    via: "cancel",
    paymentId: result.paymentId != null ? String(result.paymentId) : input.paymentId,
    refundId: result.paymentId != null ? String(result.paymentId) : input.paymentId,
    price: result.price != null ? String(result.price) : "",
    currency: result.currency != null ? String(result.currency) : "",
  };
}

/** Official trailing-zero rule for HMAC price fields. */
export function trailingZeroPrice(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (!/^-?\d+(\.\d+)?$/.test(raw)) {
    const n = Number(value);
    if (!Number.isFinite(n)) return raw;
    return trailingZeroPrice(String(n));
  }
  if (!raw.includes(".")) return raw;
  return raw.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

function hmacSha256Hex(secretKey: string, message: string): string {
  return createHmac("sha256", secretKey).update(message).digest("hex");
}

export function signaturesMatch(expectedHex: string, actualHex: string): boolean {
  const a = Buffer.from(expectedHex.toLowerCase(), "utf8");
  const b = Buffer.from(actualHex.toLowerCase(), "utf8");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

/**
 * CF Retrieve signature — docs + iyzipay 2.x sample:
 * paymentStatus, paymentId, currency, basketId, conversationId, paidPrice, price, token
 */
export function verifyCheckoutRetrieveSignature(
  result: Record<string, unknown>,
  secretKey: string
): boolean {
  const signature = String(result.signature || "").trim();
  if (!signature || !secretKey) return false;
  const params = [
    String(result.paymentStatus ?? ""),
    String(result.paymentId ?? ""),
    String(result.currency ?? ""),
    String(result.basketId ?? ""),
    String(result.conversationId ?? ""),
    trailingZeroPrice(result.paidPrice),
    trailingZeroPrice(result.price),
    String(result.token ?? ""),
  ];
  return signaturesMatch(hmacSha256Hex(secretKey, params.join(":")), signature);
}

/** payment.retrieve signature — iyzipay sample: paymentId, currency, basketId, conversationId, paidPrice, price */
export function verifyPaymentRetrieveSignature(
  result: Record<string, unknown>,
  secretKey: string
): boolean {
  const signature = String(result.signature || "").trim();
  if (!signature || !secretKey) return false;
  const params = [
    String(result.paymentId ?? ""),
    String(result.currency ?? ""),
    String(result.basketId ?? ""),
    String(result.conversationId ?? ""),
    trailingZeroPrice(result.paidPrice),
    trailingZeroPrice(result.price),
  ];
  return signaturesMatch(hmacSha256Hex(secretKey, params.join(":")), signature);
}

/**
 * Merchant webhook X-IYZ-SIGNATURE-V3.
 * Checkout Form uses HPP format; Direct format is the non-hosted fallback.
 * https://docs.iyzico.com/en/advanced/webhook
 */
export function verifyWebhookSignatureV3(secretKey: string, header: string, body: IyzicoWebhookBody): boolean {
  const received = header.trim();
  if (!received || !secretKey) return false;
  const iyziEventType = String(body.iyziEventType || "");
  const paymentConversationId = String(body.paymentConversationId || "");
  const status = String(body.status || "");
  const token = String(body.token || "");
  const iyziPaymentId = String(body.iyziPaymentId ?? "");
  const paymentId = String(body.paymentId ?? "");

  const candidates: string[] = [];
  if (token) {
    candidates.push(secretKey + iyziEventType + iyziPaymentId + token + paymentConversationId + status);
    if (paymentId && paymentId !== iyziPaymentId) {
      candidates.push(secretKey + iyziEventType + paymentId + token + paymentConversationId + status);
    }
  }
  candidates.push(secretKey + iyziEventType + (paymentId || iyziPaymentId) + paymentConversationId + status);

  return candidates.some((message) => signaturesMatch(hmacSha256Hex(secretKey, message), received));
}

export function webhookHeaderV3(req: { headers: { get(name: string): string | null } }): string {
  return (
    req.headers.get("x-iyz-signature-v3") ||
    req.headers.get("X-IYZ-SIGNATURE-V3") ||
    ""
  ).trim();
}
