import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const SECRETS_FILE = path.join(DATA_DIR, "gemini-secrets.json");
const CONFIG_FILE = path.join(DATA_DIR, "gemini-config.json");

import {
  defaultSalesChatConfig,
  type SalesChatConfig,
} from "@/types/sales-chat";
import {
  GEMINI_DEFAULT_MODEL,
  normalizeGeminiModelId,
} from "@/lib/gemini-models";
import { getGeminiDailyUsage } from "@/lib/server/gemini-usage";

export type GeminiPublicConfig = {
  model: string;
  systemInstructions: string;
  writingRules: string;
} & SalesChatConfig;

export const defaultGeminiConfig: GeminiPublicConfig = {
  model: GEMINI_DEFAULT_MODEL,
  systemInstructions: `أنت كاتب محتوى سفر محترف لوكالة الريان للسياحة (Alrayyan Tourism) في الإمارات.
اكتب مقالات ثنائية اللغة (عربي وإنجليزي) بأسلوب جذاب ومتوافق مع SEO.
عند طلب محتوى منظم، أعد JSON داخل كتلة \`\`\`json.`,
  writingRules: `- عناوين H2/H3 واضحة
- فقرات قصيرة
- 2-4 اقتراحات صور
- كلمة مفتاحية طبيعية
- لا تخترع أسعاراً أو إحصاءات
- العربي أولاً ثم الإنجليزي عند الطلب`,
  ...defaultSalesChatConfig,
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export function maskApiKey(key: string): string {
  const k = key.trim();
  if (!k) return "";
  if (k.length <= 8) return "••••••••";
  return `${k.slice(0, 4)}••••${k.slice(-4)}`;
}

type GeminiSecretsFile = {
  apiKey?: string;
  freeApiKey?: string;
};

async function readSecretsFile(): Promise<GeminiSecretsFile> {
  try {
    const raw = await fs.readFile(SECRETS_FILE, "utf8");
    return JSON.parse(raw) as GeminiSecretsFile;
  } catch {
    return {};
  }
}

export async function resolveGeminiApiKey(): Promise<{
  apiKey: string | null;
  source: "env" | "file" | "none";
}> {
  const fromEnv = process.env.GEMINI_API_KEY?.trim();
  if (fromEnv) return { apiKey: fromEnv, source: "env" };

  const key = (await readSecretsFile()).apiKey?.trim();
  if (key) return { apiKey: key, source: "file" };
  return { apiKey: null, source: "none" };
}

export async function resolveGeminiFreeApiKey(): Promise<{
  apiKey: string | null;
  source: "env" | "file" | "none";
}> {
  const fromEnv = process.env.GEMINI_FREE_API_KEY?.trim();
  if (fromEnv) return { apiKey: fromEnv, source: "env" };
  const key = (await readSecretsFile()).freeApiKey?.trim();
  if (key) return { apiKey: key, source: "file" };
  return { apiKey: null, source: "none" };
}

export async function saveGeminiApiKey(apiKey: string): Promise<void> {
  await ensureDataDir();
  const current = await readSecretsFile();
  const trimmed = apiKey.trim();
  const next: GeminiSecretsFile & { updatedAt: string } = {
    ...current,
    updatedAt: new Date().toISOString(),
  };
  if (!trimmed) delete next.apiKey;
  else next.apiKey = trimmed;
  if (!next.apiKey && !next.freeApiKey) {
    try {
      await fs.unlink(SECRETS_FILE);
    } catch {
      /* ignore */
    }
    return;
  }
  await fs.writeFile(SECRETS_FILE, JSON.stringify(next, null, 2), {
    mode: 0o600,
  });
}

export async function saveGeminiFreeApiKey(apiKey: string): Promise<void> {
  await ensureDataDir();
  const current = await readSecretsFile();
  const trimmed = apiKey.trim();
  const next: GeminiSecretsFile & { updatedAt: string } = {
    ...current,
    updatedAt: new Date().toISOString(),
  };
  if (!trimmed) delete next.freeApiKey;
  else next.freeApiKey = trimmed;
  if (!next.apiKey && !next.freeApiKey) {
    try {
      await fs.unlink(SECRETS_FILE);
    } catch {
      /* ignore */
    }
    return;
  }
  await fs.writeFile(SECRETS_FILE, JSON.stringify(next, null, 2), {
    mode: 0o600,
  });
}

export async function getGeminiPublicConfig(): Promise<GeminiPublicConfig> {
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<GeminiPublicConfig>;
    const markup = Number(parsed.salesMarkupPercent);
    return {
      ...defaultGeminiConfig,
      ...parsed,
      model: normalizeGeminiModelId(
        parsed.model || defaultGeminiConfig.model
      ),
      systemInstructions:
        parsed.systemInstructions || defaultGeminiConfig.systemInstructions,
      writingRules: parsed.writingRules || defaultGeminiConfig.writingRules,
      salesWhatsApp:
        parsed.salesWhatsApp?.trim() || defaultGeminiConfig.salesWhatsApp,
      salesMarkupPercent: Number.isFinite(markup)
        ? Math.min(200, Math.max(0, markup))
        : defaultGeminiConfig.salesMarkupPercent,
      salesInstructions:
        parsed.salesInstructions || defaultGeminiConfig.salesInstructions,
      salesWelcomeAr:
        parsed.salesWelcomeAr || defaultGeminiConfig.salesWelcomeAr,
      salesWelcomeEn:
        parsed.salesWelcomeEn || defaultGeminiConfig.salesWelcomeEn,
      salesBehaviorRules:
        parsed.salesBehaviorRules || defaultGeminiConfig.salesBehaviorRules,
      salesTone: parsed.salesTone || defaultGeminiConfig.salesTone,
      salesUpsellNotes:
        parsed.salesUpsellNotes || defaultGeminiConfig.salesUpsellNotes,
      salesSaveProgramRules:
        parsed.salesSaveProgramRules ||
        defaultGeminiConfig.salesSaveProgramRules,
      salesPreferLiteModel:
        parsed.salesPreferLiteModel !== undefined
          ? Boolean(parsed.salesPreferLiteModel)
          : defaultGeminiConfig.salesPreferLiteModel,
      salesUseGoogleSearch: Boolean(parsed.salesUseGoogleSearch),
      salesPaidKeyEnabled: Boolean(parsed.salesPaidKeyEnabled),
      dailyFreeChatLimit: Math.min(
        2000,
        Math.max(
          0,
          (() => {
            const n = Number(parsed.dailyFreeChatLimit);
            if (!Number.isFinite(n) || n === 120) {
              return defaultGeminiConfig.dailyFreeChatLimit;
            }
            return n;
          })()
        )
      ),
      dailyPaidChatLimit: Math.min(
        500,
        Math.max(
          0,
          Number(parsed.dailyPaidChatLimit) ||
            defaultGeminiConfig.dailyPaidChatLimit
        )
      ),
    };
  } catch {
    return defaultGeminiConfig;
  }
}

export async function saveGeminiPublicConfig(
  config: Partial<GeminiPublicConfig>
): Promise<GeminiPublicConfig> {
  await ensureDataDir();
  const current = await getGeminiPublicConfig();
  const next = { ...current, ...config };
  next.model = normalizeGeminiModelId(next.model);
  await fs.writeFile(CONFIG_FILE, JSON.stringify(next, null, 2));
  return next;
}

export async function getGeminiSettingsSnapshot() {
  const [{ apiKey, source }, free, config] = await Promise.all([
    resolveGeminiApiKey(),
    resolveGeminiFreeApiKey(),
    getGeminiPublicConfig(),
  ]);
  const usage = await getGeminiDailyUsage();
  return {
    ...config,
    hasApiKey: Boolean(apiKey),
    apiKeyMasked: apiKey ? maskApiKey(apiKey) : "",
    keySource: source,
    hasFreeApiKey: Boolean(free.apiKey),
    freeApiKeyMasked: free.apiKey ? maskApiKey(free.apiKey) : "",
    freeKeySource: free.source,
    usageToday: usage,
  };
}
