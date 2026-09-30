import { connectionStatus, resolveAdsCredentials } from "@/lib/ads/config";
import { getCommsSettings, publicCommsSettings } from "@/lib/automation/comms-settings";
import { listSocialDashboard } from "@/lib/social/accounts";
import { getServerEnvMap } from "@/lib/server/env-store";
import { resolveGeminiApiKey } from "@/lib/server/gemini";
import type {
  BlueprintLoop,
  BlueprintNode,
  CredentialProvider,
  CredentialRequirement,
} from "./blueprint-types";
import { normalizeBlueprintNodeType } from "./blueprint-types";

export type CredentialsPreflightResult = {
  ready: boolean;
  blocked: boolean;
  status: "ready" | "blocked_credentials";
  gaps: CredentialRequirement[];
  saySupervisorAr: string;
};

const PROVIDER_META: Record<
  CredentialProvider,
  Omit<CredentialRequirement, "provider" | "fields"> & { defaultFields: string[] }
> = {
  meta_ads: {
    labelAr: "Meta Graph API (Facebook/Instagram Ads)",
    defaultFields: ["metaAccessToken", "metaAdAccountId"],
    testRoute: "/api/admin/automation/connections",
    settingsUrl: "/admin/ads",
  },
  google_ads: {
    labelAr: "Google Ads / PMax",
    defaultFields: ["googleAdsDeveloperToken", "googleAdsCustomerId"],
    testRoute: "/api/admin/automation/connections",
    settingsUrl: "/admin/ads",
  },
  social_accounts: {
    labelAr: "حسابات السوشيال المربوطة (OAuth)",
    defaultFields: ["instagram", "facebook", "tiktok", "x"],
    testRoute: "/api/admin/automation/connections",
    settingsUrl: "/admin/social",
  },
  whatsapp: {
    labelAr: "WhatsApp Business API",
    defaultFields: ["whatsappPhoneNumberId", "whatsappAccessToken"],
    settingsUrl: "/admin/automation",
  },
  telegram: {
    labelAr: "Telegram Bot (إشعارات الإدارة)",
    defaultFields: ["telegramBotToken", "telegramAdminChatId"],
    settingsUrl: "/admin/automation",
  },
  pexels: {
    labelAr: "Pexels API (وسائط)",
    defaultFields: ["PEXELS_API_KEY"],
    testRoute: "/api/admin/media/keys",
    settingsUrl: "/admin/media",
  },
  unsplash: {
    labelAr: "Unsplash API (وسائط)",
    defaultFields: ["UNSPLASH_ACCESS_KEY"],
    testRoute: "/api/admin/media/keys",
    settingsUrl: "/admin/media",
  },
  gemini: {
    labelAr: "Gemini API (نماذج التوليد)",
    defaultFields: ["GEMINI_API_KEY"],
    testRoute: "/api/gemini/test",
    settingsUrl: "/admin/gemini",
  },
};

function req(provider: CredentialProvider, fields: string[]): CredentialRequirement {
  const meta = PROVIDER_META[provider];
  return {
    provider,
    labelAr: meta.labelAr,
    fields: fields.length ? fields : meta.defaultFields,
    testRoute: meta.testRoute,
    settingsUrl: meta.settingsUrl,
  };
}

function nodeNeedsProviders(node: BlueprintNode, sector: BlueprintLoop["sector"]): CredentialProvider[] {
  const type = normalizeBlueprintNodeType(node.type);
  const providers = new Set<CredentialProvider>();

  if (sector === "ads" || node.skills?.some((s) => /meta|google|ads|pmax/i.test(s))) {
    providers.add("meta_ads");
    providers.add("google_ads");
  }
  if (sector === "social" || (type === "action" && /social|publish|oauth/i.test(node.subtitle))) {
    providers.add("social_accounts");
  }
  if (type === "model" || sector === "video" || sector === "articles") {
    providers.add("gemini");
  }
  if (type === "skill" && /media|pexels|unsplash|watermark/i.test(`${node.subtitle} ${node.skills?.join(" ")}`)) {
    providers.add("pexels");
    providers.add("unsplash");
  }
  if (type === "review" && node.parameters.notifyTelegram === true) {
    providers.add("telegram");
  }
  if (sector === "social" && node.parameters.autoReplyDMs === true) {
    providers.add("whatsapp");
  }

  return [...providers];
}

export function requiredCredentialsForLoop(loop: BlueprintLoop): CredentialRequirement[] {
  const byProvider = new Map<CredentialProvider, CredentialRequirement>();

  for (const node of loop.nodes) {
    for (const provider of nodeNeedsProviders(node, loop.sector)) {
      if (!byProvider.has(provider)) byProvider.set(provider, req(provider, []));
    }
  }

  if (loop.sector === "ads") {
    byProvider.set("meta_ads", req("meta_ads", []));
    byProvider.set("google_ads", req("google_ads", []));
  }

  return [...byProvider.values()];
}

async function probeProvider(provider: CredentialProvider): Promise<{ ok: boolean; missingFields: string[] }> {
  switch (provider) {
    case "meta_ads":
    case "google_ads": {
      const creds = await resolveAdsCredentials();
      const ads = connectionStatus(creds);
      if (provider === "meta_ads") {
        return { ok: ads.metaLive, missingFields: [...ads.missingMeta] };
      }
      return { ok: ads.googleLive, missingFields: [...ads.missingGoogle] };
    }
    case "social_accounts": {
      const social = await listSocialDashboard();
      const connected = social.accounts.filter((a) => a.status === "connected").length;
      return connected > 0 ? { ok: true, missingFields: [] } : { ok: false, missingFields: ["oauth_linked_account"] };
    }
    case "whatsapp":
    case "telegram": {
      const comms = await getCommsSettings();
      const pub = publicCommsSettings(comms);
      if (provider === "whatsapp") {
        return pub.whatsappReady ? { ok: true, missingFields: [] } : { ok: false, missingFields: ["whatsapp"] };
      }
      return pub.telegramReady ? { ok: true, missingFields: [] } : { ok: false, missingFields: ["telegram"] };
    }
    case "pexels":
    case "unsplash": {
      const map = await getServerEnvMap(["PEXELS_API_KEY", "UNSPLASH_ACCESS_KEY"]);
      if (provider === "pexels") {
        return map.PEXELS_API_KEY ? { ok: true, missingFields: [] } : { ok: false, missingFields: ["PEXELS_API_KEY"] };
      }
      return map.UNSPLASH_ACCESS_KEY
        ? { ok: true, missingFields: [] }
        : { ok: false, missingFields: ["UNSPLASH_ACCESS_KEY"] };
    }
    case "gemini": {
      const { apiKey } = await resolveGeminiApiKey();
      return apiKey ? { ok: true, missingFields: [] } : { ok: false, missingFields: ["GEMINI_API_KEY"] };
    }
    default:
      return { ok: true, missingFields: [] };
  }
}

export async function assertReady(provider: CredentialProvider): Promise<{ ok: boolean; gap?: CredentialRequirement }> {
  const probe = await probeProvider(provider);
  if (probe.ok) return { ok: true };
  const base = req(provider, probe.missingFields);
  return { ok: false, gap: base };
}

export async function runCredentialsPreflight(loop: BlueprintLoop): Promise<CredentialsPreflightResult> {
  const required = requiredCredentialsForLoop(loop);
  const gaps: CredentialRequirement[] = [];

  for (const requirement of required) {
    const probe = await probeProvider(requirement.provider);
    if (!probe.ok) {
      gaps.push({
        ...requirement,
        fields: probe.missingFields.length ? probe.missingFields : requirement.fields,
      });
    }
  }

  if (gaps.length === 0) {
    return {
      ready: true,
      blocked: false,
      status: "ready",
      gaps: [],
      saySupervisorAr: "الجاهزية مكتملة — يمكن إطلاق التدفق.",
    };
  }

  const labels = gaps.map((g) => g.labelAr).join(" · ");
  return {
    ready: false,
    blocked: true,
    status: "blocked_credentials",
    gaps,
    saySupervisorAr: `لا يمكن إطلاق الأتمتة: ينقص ربط ${labels} — افتح درج المفاتيح أو أكمل الإعدادات.`,
  };
}
