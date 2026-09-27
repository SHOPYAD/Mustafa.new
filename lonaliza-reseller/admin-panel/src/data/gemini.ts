import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";
import { GEMINI_DEFAULT_MODEL, normalizeGeminiModelId } from "@/lib/gemini-models";

/**
 * Client Gemini helpers — API key is NEVER stored in the browser.
 * Server uses GEMINI_API_KEY env (preferred) or .data/gemini-secrets.json.
 */

export type GeminiClientSettings = {
  model: string;
  systemInstructions: string;
  writingRules: string;
  salesWhatsApp: string;
  salesMarkupPercent: number;
  salesInstructions: string;
  salesWelcomeAr: string;
  salesWelcomeEn: string;
  salesBehaviorRules: string;
  salesTone: string;
  salesUpsellNotes: string;
  salesSaveProgramRules: string;
  salesPreferLiteModel: boolean;
  salesUseGoogleSearch: boolean;
  dailyFreeChatLimit: number;
  dailyPaidChatLimit: number;
  salesPaidKeyEnabled: boolean;
  hasApiKey: boolean;
  apiKeyMasked: string;
  keySource: "env" | "file" | "none";
  hasFreeApiKey: boolean;
  freeApiKeyMasked: string;
  freeKeySource: "env" | "file" | "none";
  usageToday: { date: string; freeCount: number; paidCount: number };
};

function mapSettings(data: { settings: Record<string, unknown> }): GeminiClientSettings {
  const s = data.settings;
  return {
    model: normalizeGeminiModelId(String(s.model || GEMINI_DEFAULT_MODEL)),
    systemInstructions: String(s.systemInstructions || ""),
    writingRules: String(s.writingRules || ""),
    salesWhatsApp: String(s.salesWhatsApp || DEFAULT_SITE_WHATSAPP),
    salesMarkupPercent: Number(s.salesMarkupPercent) || 15,
    salesInstructions: String(s.salesInstructions || ""),
    salesWelcomeAr: String(s.salesWelcomeAr || ""),
    salesWelcomeEn: String(s.salesWelcomeEn || ""),
    salesBehaviorRules: String(s.salesBehaviorRules || ""),
    salesTone: String(s.salesTone || ""),
    salesUpsellNotes: String(s.salesUpsellNotes || ""),
    salesSaveProgramRules: String(s.salesSaveProgramRules || ""),
    salesPreferLiteModel: s.salesPreferLiteModel !== false,
    salesUseGoogleSearch: Boolean(s.salesUseGoogleSearch),
    dailyFreeChatLimit: Number(s.dailyFreeChatLimit) || 1500,
    dailyPaidChatLimit: Number(s.dailyPaidChatLimit) || 20,
    salesPaidKeyEnabled: Boolean(s.salesPaidKeyEnabled),
    hasApiKey: Boolean(s.hasApiKey),
    apiKeyMasked: String(s.apiKeyMasked || ""),
    keySource: (s.keySource as "env" | "file" | "none") || "none",
    hasFreeApiKey: Boolean(s.hasFreeApiKey),
    freeApiKeyMasked: String(s.freeApiKeyMasked || ""),
    freeKeySource: (s.freeKeySource as "env" | "file" | "none") || "none",
    usageToday: {
      date: String((s.usageToday as { date?: string } | undefined)?.date || ""),
      freeCount:
        Number((s.usageToday as { freeCount?: number } | undefined)?.freeCount) ||
        0,
      paidCount:
        Number((s.usageToday as { paidCount?: number } | undefined)?.paidCount) ||
        0,
    },
  };
}

export async function fetchGeminiSettings(): Promise<GeminiClientSettings> {
  const res = await fetch("/api/gemini/settings", {
    cache: "no-store",
    credentials: "same-origin",
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to load AI settings");
  return mapSettings(data);
}

export async function saveGeminiSettings(input: {
  model: string;
  systemInstructions: string;
  writingRules: string;
  salesWhatsApp?: string;
  salesMarkupPercent?: number;
  salesInstructions?: string;
  salesWelcomeAr?: string;
  salesWelcomeEn?: string;
  salesBehaviorRules?: string;
  salesTone?: string;
  salesUpsellNotes?: string;
  salesSaveProgramRules?: string;
  salesPreferLiteModel?: boolean;
  salesUseGoogleSearch?: boolean;
  dailyFreeChatLimit?: number;
  dailyPaidChatLimit?: number;
  salesPaidKeyEnabled?: boolean;
  apiKey?: string;
  freeApiKey?: string;
  clearApiKey?: boolean;
  clearFreeApiKey?: boolean;
}): Promise<GeminiClientSettings> {
  const res = await fetch("/api/gemini/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to save AI settings");
  return mapSettings(data);
}
