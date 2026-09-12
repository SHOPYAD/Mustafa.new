import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";
import {
  getServerEnv,
  getServerEnvMap,
  isMaskedPlaceholder,
  maskSecret,
} from "@/lib/server/env-store";
import { normalizeWhatsAppNumber } from "@/lib/utils";

export type IyzicoMerchantUrls = {
  origin: string;
  callbackUrl: string;
  webhookUrl: string;
  sandboxApi: string;
  productionApi: string;
};

export async function getIyzicoMerchantUrls(): Promise<IyzicoMerchantUrls> {
  const origin = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));
  return {
    origin,
    callbackUrl: `${origin}/api/payments/iyzico/callback`,
    webhookUrl: `${origin}/api/payments/iyzico/webhook`,
    sandboxApi: "https://sandbox-api.iyzipay.com",
    productionApi: "https://api.iyzipay.com",
  };
}

export const PAYMENTS_ENV_KEYS = [
  "PAYMENTS_IYZICO_ENABLED",
  "PAYMENTS_WHATSAPP_BANK_LINK_ENABLED",
  "IYZICO_MODE",
  "IYZICO_API_KEY",
  "IYZICO_SECRET_KEY",
  "IYZICO_BASE_URL",
  "PAYMENTS_WHATSAPP_NUMBER",
] as const;

export type IyzicoMode = "sandbox" | "production";

export type PaymentsPublicConfig = {
  iyzicoEnabled: boolean;
  whatsappBankLinkEnabled: boolean;
  iyzicoMode: IyzicoMode;
  whatsappNumber: string;
};

export type IyzicoSecrets = {
  enabled: boolean;
  mode: IyzicoMode;
  apiKey: string;
  secretKey: string;
  baseUrl: string;
};

function isOn(value: string): boolean {
  const raw = String(value || "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

export function iyzicoDefaultBaseUrl(mode: IyzicoMode): string {
  return mode === "production" ? "https://api.iyzipay.com" : "https://sandbox-api.iyzipay.com";
}

export async function getPaymentsMap(): Promise<Record<string, string>> {
  return getServerEnvMap(PAYMENTS_ENV_KEYS);
}

export async function getPaymentsPublicConfig(): Promise<PaymentsPublicConfig> {
  const map = await getPaymentsMap();
  const mode: IyzicoMode = map.IYZICO_MODE === "production" ? "production" : "sandbox";
  const whatsapp =
    normalizeWhatsAppNumber(map.PAYMENTS_WHATSAPP_NUMBER) || DEFAULT_SITE_WHATSAPP;
  return {
    iyzicoEnabled: isOn(map.PAYMENTS_IYZICO_ENABLED) && Boolean(map.IYZICO_API_KEY && map.IYZICO_SECRET_KEY),
    whatsappBankLinkEnabled: map.PAYMENTS_WHATSAPP_BANK_LINK_ENABLED
      ? isOn(map.PAYMENTS_WHATSAPP_BANK_LINK_ENABLED)
      : true,
    iyzicoMode: mode,
    whatsappNumber: whatsapp,
  };
}

/** Strip copy/paste noise. Masked admin placeholders become empty (never sent to iyzico). */
export function normalizeIyzicoCredential(raw: string): string {
  let value = String(raw ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  const quoted =
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2);
  if (quoted) {
    value = value.slice(1, -1).replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  }
  if (isMaskedPlaceholder(value)) return "";
  return value;
}

export async function getIyzicoSecrets(): Promise<IyzicoSecrets> {
  const map = await getPaymentsMap();
  const mode: IyzicoMode = map.IYZICO_MODE === "production" ? "production" : "sandbox";
  const override = String(map.IYZICO_BASE_URL || "").trim();
  return {
    enabled: isOn(map.PAYMENTS_IYZICO_ENABLED),
    mode,
    apiKey: normalizeIyzicoCredential(map.IYZICO_API_KEY || ""),
    secretKey: normalizeIyzicoCredential(map.IYZICO_SECRET_KEY || ""),
    baseUrl: override || iyzicoDefaultBaseUrl(mode),
  };
}

export async function getPaymentsAdminValues(): Promise<Record<string, string>> {
  const map = await getPaymentsMap();
  return {
    PAYMENTS_IYZICO_ENABLED: isOn(map.PAYMENTS_IYZICO_ENABLED) ? "true" : "false",
    PAYMENTS_WHATSAPP_BANK_LINK_ENABLED: map.PAYMENTS_WHATSAPP_BANK_LINK_ENABLED
      ? isOn(map.PAYMENTS_WHATSAPP_BANK_LINK_ENABLED)
        ? "true"
        : "false"
      : "true",
    IYZICO_MODE: map.IYZICO_MODE === "production" ? "production" : "sandbox",
    IYZICO_API_KEY: map.IYZICO_API_KEY ? maskSecret(map.IYZICO_API_KEY) : "",
    IYZICO_SECRET_KEY: map.IYZICO_SECRET_KEY ? maskSecret(map.IYZICO_SECRET_KEY) : "",
    IYZICO_BASE_URL: map.IYZICO_BASE_URL || "",
    PAYMENTS_WHATSAPP_NUMBER: map.PAYMENTS_WHATSAPP_NUMBER || "",
  };
}

export function sanitizePaymentsPatch(
  incoming: Record<string, string>,
  existing?: Record<string, string>
): Record<string, string> {
  const patch: Record<string, string> = {};
  if ("PAYMENTS_IYZICO_ENABLED" in incoming) {
    patch.PAYMENTS_IYZICO_ENABLED = isOn(incoming.PAYMENTS_IYZICO_ENABLED) ? "true" : "false";
  }
  if ("PAYMENTS_WHATSAPP_BANK_LINK_ENABLED" in incoming) {
    patch.PAYMENTS_WHATSAPP_BANK_LINK_ENABLED = isOn(
      incoming.PAYMENTS_WHATSAPP_BANK_LINK_ENABLED
    )
      ? "true"
      : "false";
  }
  if ("IYZICO_MODE" in incoming) {
    patch.IYZICO_MODE =
      String(incoming.IYZICO_MODE || "").toLowerCase() === "production" ? "production" : "sandbox";
  }
  if ("IYZICO_API_KEY" in incoming) {
    const raw = normalizeIyzicoCredential(incoming.IYZICO_API_KEY || "");
    if (raw) patch.IYZICO_API_KEY = raw;
  }
  if ("IYZICO_SECRET_KEY" in incoming) {
    const raw = normalizeIyzicoCredential(incoming.IYZICO_SECRET_KEY || "");
    if (raw) patch.IYZICO_SECRET_KEY = raw;
  }
  if ("IYZICO_BASE_URL" in incoming) {
    patch.IYZICO_BASE_URL = String(incoming.IYZICO_BASE_URL || "").trim();
  }
  if ("PAYMENTS_WHATSAPP_NUMBER" in incoming) {
    patch.PAYMENTS_WHATSAPP_NUMBER = normalizeWhatsAppNumber(
      String(incoming.PAYMENTS_WHATSAPP_NUMBER || "")
    );
  }
  const savedNewKey = Boolean(patch.IYZICO_API_KEY || patch.IYZICO_SECRET_KEY);
  const apiKey = patch.IYZICO_API_KEY || existing?.IYZICO_API_KEY || "";
  const secretKey = patch.IYZICO_SECRET_KEY || existing?.IYZICO_SECRET_KEY || "";
  if (savedNewKey && apiKey && secretKey) {
    patch.PAYMENTS_IYZICO_ENABLED = "true";
  }
  return patch;
}
